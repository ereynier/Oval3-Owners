/* Recover missing transfers from the blockchain */
import { PrismaClient } from '@prisma/client'

import { client } from "./utils/client";
import { saveTransfers } from './utils/SaveTransfers';
const Oval3Abi = require("./utils/abi/Oval3.abi.json");


const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"

const prisma = new PrismaClient()


async function getTransfers(fromBlock: number) {

    const k = 10000
    let toBlock = await client.getBlockNumber()

    let i = fromBlock
    while (i < toBlock) {
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
                saveTransfers(from, to, tokenId, prisma);
            } 
        }

        i += k
        // update toBlock to the latest block
        if (i > toBlock) {
            toBlock = await client.getBlockNumber()
        }
    }
}

    async function main() {

        // get last block executed
        const lastBlock = await prisma.blocks.findFirst({
            orderBy: {
                blockNumber: 'desc'
            }
        })

        let fromBlock = 41250758; // 1 block before first Transfer of the contract 
        // if (lastBlock) {
        //     fromBlock = lastBlock.blockNumber //TODO: uncomment 
        // }

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

