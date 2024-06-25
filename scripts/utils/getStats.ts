export const getStats = async (opta_id: string) => {
    const res = await fetch(`https://score.oval3.game/api/scoring/player/${opta_id}`);
    const stats = await res.json() as any;
    if (!stats || stats.error) {
        console.log("error fetching stats", stats)
        return;
    }
    return stats.data;
}


getStats("56703").then(console.log)