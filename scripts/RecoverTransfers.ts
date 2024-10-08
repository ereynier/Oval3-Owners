/* Recover missing transfers from the blockchain */
import { PrismaClient } from '@prisma/client'

import { client } from "./utils/client";
import { saveTransfers } from './utils/SaveTransfers';
import * as fs from 'fs';
import * as path from 'path';
import dns from 'dns';
const Oval3Abi = require("./utils/abi/Oval3.abi.json");


const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"
const DOCKER = process.env.DOCKER || false

const prisma = new PrismaClient()

const projectRoot = path.resolve(__dirname, '../');
const logsDir = path.join(projectRoot, 'logs');

async function getTransfers(fromBlock: number) {

    const k = 10000
    let toBlock = await client.getBlockNumber()

    let i = fromBlock
    // get all transfers from the last checked block to the most recent one
    while (i < toBlock) {
        if (!DOCKER) {
            console.log('Getting transfers from block', i, 'to', i + k)
        }
        const logs = await client.getContractEvents({
            abi: Oval3Abi,
            address: CONTRACT_ADDRESS,
            eventName: 'Transfer',
            fromBlock: BigInt(i),
            toBlock: BigInt(i + k)
        }) as {
            eventName: string, 
            args: { from: string, to: string, tokenId: bigint }, 
            address: string, 
            blockHash: string, 
            blockNumber: bigint, 
            data: string, 
            logIndex: number, 
            removed: boolean, 
            topics: [string], 
            transactionHash: string, 
            transactionIndex: number
        }[]

        const transfersList : {from: string, to: string, tokenId: number}[] = []
        for (let log of logs) {
            const from = log.args.from;
            const to = log.args.to;
            const tokenId = Number(log.args.tokenId);
            // console.log(`From: ${from} To: ${to} TokenId: ${tokenId}`)
            if (from !== to) {
                await saveTransfers(from, to, tokenId, prisma);
                transfersList.push({ from, to, tokenId })
            } 
        }
        const date = new Date().toISOString()
        fs.writeFileSync(`${logsDir}/recover.log`, `    - [${date}] - Block ${i} to ${i + k}\n${transfersList.map(transfer => {return `        - From: ${transfer.from} To: ${transfer.to} TokenId: ${transfer.tokenId}`}).join('\n')}\n`, { flag: 'a' });

        i += k
        // update toBlock to the latest block
        if (i > toBlock) {
            toBlock = await client.getBlockNumber()
        }
    }
}

    async function main() {
        if (!CONTRACT_ADDRESS) {
            throw new Error('CONTRACT_ADDRESS is required')
        }

        // get last block executed
        const lastBlock = await prisma.blocks.findFirst({
            orderBy: {
                blockNumber: 'desc'
            }
        })

        let fromBlock = 41250758; // 1 block before first Transfer of the contract 
        if (lastBlock && lastBlock.blockNumber > fromBlock) {
            fromBlock = lastBlock.blockNumber
        }

        console.log('Recovering transfers from block', fromBlock);
        const date = new Date()
        fs.writeFileSync(`${logsDir}/recover.log`, `[INFO] - [${date.toISOString()}] - Recovering transfers from block ${fromBlock}\n`, { flag: 'a' });
        // get all transfers from the contract
        const getTransferPromise = getTransfers(fromBlock)
        const internetCheckerInterval = setInterval(() => {
            // console.log('Checking internet connection');
            dns.lookup('google.com', (err) => {
                if (err) {
                    fs.writeFileSync(`${logsDir}/recover.log`, `[ERROR] - [${date.toISOString()}] - No internet connection: ${err} \n`, { flag: 'a' });
                    console.error('No internet connection, stopping RecoverTransfers script');
                    console.error(err)
                    throw new Error('No internet connection');
                }
            });
        }, 5000);

        await getTransferPromise
        clearInterval(internetCheckerInterval)
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

