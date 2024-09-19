/* get all owners of the contract and save them in the database */
import { PrismaClient } from '@prisma/client'

import { client } from "./utils/client";
import { argv } from "process";
import * as fs from 'fs';
import * as path from 'path';
import dns from 'dns';
const Oval3Abi = require("./utils/abi/Oval3.abi.json");

const projectRoot = path.resolve(__dirname, '../');
const logsDir = path.join(projectRoot, 'logs');

const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"
const DOCKER = process.env.DOCKER || false

const prisma = new PrismaClient()

async function saveOwner(owner: `0x${string}`, tokenId: number) {
    const ownerData = await prisma.owners.findUnique({
        where: {
            address: owner
        }
    })
    // update or create owner in DB
    if (ownerData) {
        await prisma.owners.update({
            where: {
                address: owner
            },
            data: {
                nfts: [...ownerData.nfts, tokenId]
            }
        })
    } else {
        await prisma.owners.create({
            data: {
                address: owner,
                nfts: [tokenId]
            }
        })
    }
}

async function getOwners(contractAddress: `0x${string}`, maxId = 0) {

    // const owners: { [key: `0x${string}`]: number[] } = {};

    let totalSupply = await client.readContract({
        address: contractAddress,
        abi: Oval3Abi as any,
        functionName: "totalSupply",
        args: [],
    });

    if (maxId > 0) {
        totalSupply = maxId;
    }

    for (let i = 0; i < Number(totalSupply); i++) {
        const owner = await client.readContract({
            address: contractAddress,
            abi: Oval3Abi as any,
            functionName: "ownerOf",
            args: [i],
        }) as `0x${string}`;
        // owners[owner] = [...(owners[owner] || []), i];
        await saveOwner(owner, i);
        if (DOCKER) {
            fs.writeFileSync(`${logsDir}/fill.log`, `${((i / Number(totalSupply)) * 100).toFixed(0)} / 100 - ${i} / ${Number(totalSupply)}\n`, { flag: 'a' });
            fs.writeFileSync(`${logsDir}/getOwners.log`, `${owner}, ${i}\n`, { flag: 'a' });
        } else {
            console.log(`${((i / Number(totalSupply)) * 100).toFixed(0)} / 100 - ${i} / ${Number(totalSupply)}`)
        }
    }

    const blockNb = await client.getBlockNumber();
    // const datas = { "block": Number(blockNb), "owners": owners }
    // fs.writeFileSync('./data.json', JSON.stringify(datas, null, 2), 'utf-8');
    fs.writeFileSync(`${logsDir}/fill.log`, `Finished at block ${blockNb}\n`, { flag: 'a' });
}



async function main() {

    const maxId = Number(argv[2]) || 0;
    // If file `logs/fill.log` exists, don't execute the script
    const logsDir = path.join(projectRoot, 'logs');
    if (fs.existsSync(`${logsDir}/fill.log`)) {
        console.log("Already executed");
        return;
    }
    // DELETE ALL OWNERS FROM THE DATABASE
    const owners = await prisma.owners.deleteMany({});
    console.log("Deleted all owners", owners);
    getOwners(CONTRACT_ADDRESS, maxId);

    const blocks = await prisma.blocks.deleteMany({});
    console.log("Deleted all blocks", blocks);
    const block = await prisma.blocks.create({
        data: {
            blockNumber: Number(await client.getBlockNumber()),
            id: 1,
            updatedAt: new Date()
        }
    });

    setInterval(() => {
        // console.log('Checking internet connection');
        dns.lookup('google.com', (err) => {
            if (err) {
                const date = new Date().toISOString()
                fs.writeFileSync(`${logsDir}/getOwners.log`, `[ERROR] - [${date}] - No internet connection: ${err} \n`, { flag: 'a' });
                fs.writeFileSync(`${logsDir}/fill.log`, `[ERROR] - [${date}] - No internet connection: ${err} \n`, { flag: 'a' });
                console.error('No internet connection, stopping GetOwners script');
                console.error(err)
                throw new Error('No internet connection');
            }
        });
    }, 5000);
    
}


main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)

    })


