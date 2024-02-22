/* listen to Transfer events on a contract and update the owners of the NFTs in the database */
import { PrismaClient } from '@prisma/client'
import { client } from "./utils/client";
const Oval3Abi = require("./utils/abi/Oval3.abi.json");
import * as fs from 'fs';
import { isAddress, zeroAddress } from "viem";
import { saveTransfers } from './utils/SaveTransfers';
// const ownersJSON = require("..//utils/datas/owners.json");

const prisma = new PrismaClient()

const CONTRACT_ADDRESS = "0x83a5564378839EeF0721bc68A0fbeb92e2dE73d2"
// const owners = { ...ownersJSON.owners } as { [key: `0x${string}`]: number[] };

async function updateOwners(logs: any) {
    // console.log("Updating owners", logs);
    const transfers = logs.map((log: any) => {
        return {
            from: log.args.from,
            to: log.args.to,
            tokenId: Number(log.args.tokenId)
        }
    })
    // console.log("Transfers", transfers)

    for (let transfer of transfers) {
        const from = transfer.from;
        const to = transfer.to;
        const tokenId = transfer.tokenId;
        if (from !== to) {
            await saveTransfers(from, to, tokenId, prisma);
        }
        console.log("Transfer from", from, "to", to, "tokenId", tokenId);
    }
    const blockNb = await client.getBlockNumber();
    const date = new Date().toISOString();
    fs.writeFileSync(`../logs/transfers.log`, `[${date}] - Block ${blockNb} - ${transfers.length} transfers\n`, { flag: 'a' });
    const block = await prisma.blocks.update({
        where: {
            id: 1
        },
        data: {
            blockNumber: Number(blockNb)
        }
    })
    // const datas = { "block": Number(blockNb), "owners": owners }
    // fs.writeFileSync('./data.json', JSON.stringify(datas, null, 2), 'utf-8');
}

async function TransferListener(contractAddress: `0x${string}`) {

    const unwatch = client.watchContractEvent({
        address: contractAddress,
        abi: Oval3Abi,
        eventName: 'Transfer',
        onLogs: async (logs: any) => {
            await updateOwners(logs);
        }
    });
}

async function main() {

    if (!CONTRACT_ADDRESS) {
        throw new Error('CONTRACT_ADDRESS is required')
    }
    if (!isAddress(CONTRACT_ADDRESS)) {
        throw new Error('CONTRACT_ADDRESS is not a valid address')
    }

    console.log('Listening for Transfer events on contract', CONTRACT_ADDRESS);
    TransferListener(CONTRACT_ADDRESS);

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


