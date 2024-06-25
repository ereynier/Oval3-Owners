import { PrismaClient } from "@prisma/client";

export const updateStats = async (stats: any, opta_id: string, prisma: PrismaClient) => {

    const playerStats = await prisma.player.upsert({
        where: {
            opta_id: String(opta_id)
        },
        update: {
            scoring: Number(stats.scoring),
            last_scoring: Number(stats.last_scoring),
            evolution: Number(stats.evolution),
            impact: Number(stats.impact),
            attack: Number(stats.attack),
            defense: Number(stats.defense),
            skills: Number(stats.skills),
            strength: Number(stats.strength),
            minutes_played_total: Number(stats.minutes_played_total),
            red_cards: Number(stats.red_cards),
            yellow_cards: Number(stats.yellow_cards),
            tries: Number(stats.tries),
            appearances: Number(stats.appearances),
            updatedAt: new Date()
        },
        create: {
            opta_id: String(opta_id),
            scoring: Number(stats.scoring),
            last_scoring: Number(stats.last_scoring),
            evolution: Number(stats.evolution),
            impact: Number(stats.impact),
            attack: Number(stats.attack),
            defense: Number(stats.defense),
            skills: Number(stats.skills),
            strength: Number(stats.strength),
            minutes_played_total: Number(stats.minutes_played_total),
            red_cards: Number(stats.red_cards),
            yellow_cards: Number(stats.yellow_cards),
            tries: Number(stats.tries),
            appearances: Number(stats.appearances),
            updatedAt: new Date(),
        }
    })

    if (!playerStats) {
        console.log('Error updating stats for player', opta_id);
        return;
    }
    if (!stats.nb_games) {
        console.log('No games to update for player', opta_id);
        return;
    }
    for (let game of stats.nb_games) {

        const savedGame = await prisma.game.findFirst({
            where: {
                playerOpta_id: String(opta_id),
                game_date: game.game_date
            }
        })
        if (!savedGame) {
            const gameStats = await prisma.game.create({
                data: {
                    attack: Number(game.attack),
                    defense: Number(game.defense),
                    game_date: game.game_date,
                    impact: Number(game.impact),
                    metadata_total: Number(game.metadata_total),
                    skills: Number(game.skills),
                    strength: Number(game.strength),
                    playerOpta_id: String(opta_id),
                    updatedAt: new Date(),
                }
            })

            if (!gameStats) {
                console.log('Error updating game stats for player', opta_id);
                return;
            }
        }
    }
}