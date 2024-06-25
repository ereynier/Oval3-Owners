import { PrismaClient } from '@prisma/client'
import * as fs from 'fs';
import * as path from 'path';
import dns from 'dns';
import { getStats } from './utils/getStats';
import { updateStats } from './utils/updateStats';

const prisma = new PrismaClient()

const projectRoot = path.resolve(__dirname, '../');
const logsDir = path.join(projectRoot, 'logs');

export const update = async () => {
    // get opta_id list
    const players = await prisma.player.findMany({
        select: {
            opta_id: true
        }
    })

    if (!players) {
        console.log('No players found');
        return;
    }

    for (let player of players) {
        const stats = await getStats(String(player.opta_id));
        if (!stats) {
            console.log('No stats found');
            return;
        }

        updateStats(stats, player.opta_id, prisma);


        // fs.writeFileSync(`${logsDir}/updateStats.log`, `[INFO] - [${date.toISOString()}] - Stats updated for player ${player.opta_id} \n`, { flag: 'a' });
        // console.log('Stats updated for player', player.opta_id);

    }


}

async function main() {
    const updateInterval = setInterval(async () => {
        const date = new Date()
        // if date > monday 10:00 && < tuesday 10:00
        if ((date.getDay() >= 1 && date.getHours() > 10) && (date.getDay() <= 2 && date.getHours() < 10)) {
            console.log('Updating stats');
            fs.writeFileSync(`${logsDir}/updateStats.log`, `[INFO] - [${date.toISOString()}] - Updating stats \n`, { flag: 'a' });
            update();
        }
    }, 1000 * 60 * 60 * 24);


    const internetCheckerInterval = setInterval(() => {
        // console.log('Checking internet connection');
        dns.lookup('google.com', (err) => {
            if (err && err.code == "ENOTFOUND") {
                const date = new Date()
                fs.writeFileSync(`${logsDir}/updateStats.log`, `[ERROR] - [${date.toISOString()}] - No internet connection \n`, { flag: 'a' });
                console.error('No internet connection, stopping updateStats script');
                clearInterval(updateInterval);
                clearInterval(internetCheckerInterval);
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