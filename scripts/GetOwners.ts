/* get all owners of the contract and save them in the database */
import { PrismaClient } from '@prisma/client'

import { client } from "./utils/client";
import { argv } from "process";
const Oval3Abi = require("./utils/abi/Oval3.abi.json");


const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"

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
        console.log(`${((i / Number(totalSupply)) * 100).toFixed(0)} / 100 - ${i} / ${Number(totalSupply)}`)
    }

    const blockNb = await client.getBlockNumber();
    // const datas = { "block": Number(blockNb), "owners": owners }
    // fs.writeFileSync('./data.json', JSON.stringify(datas, null, 2), 'utf-8');
}



async function main() {

    const maxId = Number(argv[2]) || 0;
    getOwners(CONTRACT_ADDRESS, maxId);
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


