import { PrismaClient } from "@prisma/client";
import { isAddress, zeroAddress } from "viem";

export const saveTransfers = async (from: string, to: string, tokenId: number, prisma: PrismaClient) => {
    const fromOwner = await prisma.owners.findUnique({
        where: {
            address: from
        }
    })
    const toOwner = await prisma.owners.findUnique({
        where: {
            address: to
        }
    })
    console.log("From owner", fromOwner)
    console.log("To owner", toOwner)
    // remove tokenId from "from" and add it to "to" in DB (create "to" if not existing). If "from" address is not in DB or don't have the tokenId, just add the tokenId to "to" address
    if (fromOwner && fromOwner.address != zeroAddress) {
        const data = await prisma.owners.update({
            where: {
                address: from
            },
            data: {
                nfts: {
                    set: fromOwner.nfts.filter(nft => nft !== tokenId)
                }
            }
        })
        // console.log("Data1", data)
    }
    if (toOwner && toOwner.address != zeroAddress) {
        const data = await prisma.owners.update({
            where: {
                address: to
            },
            data: {
                nfts: {
                    set: [...toOwner.nfts, tokenId]
                }
            }
        })
        // console.log("Data2", data)
    } else {
        const data = await prisma.owners.create({
            data: {
                address: to,
                nfts: [tokenId]
            }
        })
        // console.log("Data3", data)
    }
}