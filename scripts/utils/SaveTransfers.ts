import { PrismaClient } from "@prisma/client";
import { isAddress, zeroAddress } from "viem";
import { getAdditionals } from "./getAdditionals";
import { Decimal } from "@prisma/client/runtime/library";
import { getStats } from "./getStats";
import { updateStats } from "./updateStats";

export const saveTransfers = async (from: string, to: string, tokenId: number, prisma: PrismaClient) => {

    // check if address is valid
    if (!isAddress(from) || !isAddress(to)) {
        console.log("Invalid address")
        return;
    }
    // // get current card
    // const currentCard = await prisma.card.findUnique({
    //     where: {
    //         tokenId: String(tokenId)
    //     }
    // })

    // // if card and optaId exists, update owner
    // if (currentCard && currentCard.opta_id) {
    //     const card = await prisma.card.update({
    //         where: {
    //             tokenId: String(tokenId)
    //         },
    //         data: {
    //             owner: to,
    //             updatedAt: new Date()
    //         }
    //     })
    //     if (!card) {
    //         console.log(`Error updating card ${tokenId}`)
    //         return;
    //     }
    //     return;
    // }

    // get optaId if exists
    const additionals = await getAdditionals(tokenId)
    let card: { owner: string; rarity: string | null; tokenId: string; opta_id: string | null; createdAt: Date; updatedAt: Date; max_serial_Number: Decimal | null; serial_Number: Decimal | null; academy: boolean | null; age: number | null; clubCode: string | null; clubName: string | null; competition: string | null; image: string | null; international: boolean | null; name: string | null; nationality: string | null; position: string | null; season: string | null; }

    // no additionals, just upsert owner
    if (!additionals) {
        card = await prisma.card.upsert({
            where: {
                tokenId: String(tokenId)
            },
            update: {
                owner: to,
                updatedAt: new Date()
            },
            create: {
                tokenId: String(tokenId),
                owner: to,
                updatedAt: new Date()
            }
        })
    } else {
        // upsert card with additionals
        const stats = await getStats(String(additionals.optaId));
        if (!stats) {
            console.log('No stats found');
            return;
        }

        await updateStats(stats, additionals.optaId, prisma);

        card = await prisma.card.upsert({
            where: {
                tokenId: String(tokenId)
            },
            update: {
                owner: to,
            },
            create: {
                tokenId: String(tokenId),
                rarity: additionals.rarity,
                owner: to,
                serial_Number: Number(additionals.edition.split("/")[0]),
                max_serial_Number: Number(additionals.edition.split("/")[1]),
                international: additionals.international,
                academy: additionals.academy,
                opta_id: String(additionals.optaId),
                season: additionals.season,
                competition: additionals.competition,
                clubCode: additionals.club.clubCode,
                clubName: additionals.club.name,
                image: additionals.image,
                name: additionals.firstname + " " + additionals.lastname,
                position: additionals.position,
                age: Number(additionals.age),
                nationality: additionals.nationality,
                updatedAt: new Date()
            }
        })
    }
    if (!card) {
        console.log(`Error upsert card ${tokenId}`)
        return;
    }
}

//     // console.log("From owner", fromOwner)
//     // console.log("To owner", toOwner)
//     // remove tokenId from "from" and add it to "to" in DB (create "to" if not existing). If "from" address is not in DB or don't have the tokenId, just add the tokenId to "to" address
//     if (fromOwner && fromOwner.address != zeroAddress) {
//         const data = await prisma.owners.update({
//             where: {
//                 address: from
//             },
//             data: {
//                 nfts: {
//                     set: fromOwner.nfts.filter(nft => nft !== tokenId)
//                 }
//             }
//         })
//         // console.log("Data1", data)
//     }
//     if (toOwner && toOwner.address != zeroAddress) {
//         const data = await prisma.owners.update({
//             where: {
//                 address: to
//             },
//             data: {
//                 nfts: {
//                     set: [...new Set([...toOwner.nfts, tokenId])]
//                 }
//             }
//         })
//         // console.log("Data2", data)
//     } else {
//         const data = await prisma.owners.create({
//             data: {
//                 address: to,
//                 nfts: [tokenId]
//             }
//         })
//         // console.log("Data3", data)
//     }
// }