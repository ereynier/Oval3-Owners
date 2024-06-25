export const getAdditionals = async (tokenId: number) => {
    const res2 = await fetch("https://api.oval3.game/graphql/", {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "content-type": "application/json",
            "apollographql-client-name": "era2140-oval3",
            "apollographql-client-version": "0.0.1",
            "Access-Control-Allow-Origin": "*",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        },
        "referrer": "https://marketplace.oval3.game/",
        "body": "{\"operationName\":\"findCard\",\"variables\":{\"tokenId\":\"" + String(tokenId) + "\",\"similarPlayer\":false},\"query\":\"query findCard($tokenId: String!, $similarPlayer: Boolean) {\\n  Card(tokenId: $tokenId, similarCard: $similarPlayer) {\\n    tokenId\\n    rarity\\n    owner {\\n      address\\n    }\\n    edition\\n    international\\n    academy\\n    similarPlayers {\\n      image\\n      tokenId\\n    }\\n    optaId\\n    season\\n    competition\\n    club {\\n      name\\n      clubCode\\n    }\\n    bidCount\\n    score\\n    image\\n    firstname\\n    lastname\\n    position\\n    age\\n    nationality\\n    listingStatus\\n    amount\\n    endTime\\n  }\\n}\"}",
        "method": "POST",
        "mode": "cors"
    });
    const additional = await res2.json() as any;
    if (!additional || additional.errors) {
        console.log("error fetching additional", additional)
        return;
    }
    return additional.data.Card;
}


getAdditionals(1).then(console.log)