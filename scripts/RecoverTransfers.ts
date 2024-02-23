/* Recover missing transfers from the blockchain */
import { PrismaClient } from '@prisma/client'

import { client } from "./utils/client";
import { saveTransfers } from './utils/SaveTransfers';
import * as fs from 'fs';
import * as path from 'path';
const Oval3Abi = require("./utils/abi/Oval3.abi.json");


const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"

const prisma = new PrismaClient()

const projectRoot = path.resolve(__dirname, '../');

async function getTransfers(fromBlock: number) {

    const k = 10000
    let toBlock = await client.getBlockNumber()

    let i = fromBlock
    // get all transfers from the last checked block to the most recent one
    while (i < toBlock) {
        console.log('Getting transfers from block', i, 'to', i + k)
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


        for (let log of logs) {
            const from = log.args.from;
            const to = log.args.to;
            const tokenId = Number(log.args.tokenId);
            // console.log(`From: ${from} To: ${to} TokenId: ${tokenId}`)
            if (from !== to) {
                await saveTransfers(from, to, tokenId, prisma);
            } 
        }
        const logsDir = path.join(projectRoot, 'logs');
        fs.writeFileSync(`${logsDir}/recover.log`, `Block ${i} to ${i + k} - ${logs.length} transfers\n`, { flag: 'a' });

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
        // get all transfers from the contract
        getTransfers(fromBlock)
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

