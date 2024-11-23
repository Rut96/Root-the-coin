const SESSION_DURATION = 1000 * 60 * 2;

function getCoinInfoFromSession(coinId) {
    try {
        const sessionData = JSON.parse(sessionStorage.getItem('coinInfo')) || {};
        const currentTime = new Date().getTime();
        const coinInfo = sessionData[coinId];

        if (coinInfo && currentTime - coinInfo.timestamp < SESSION_DURATION) {
            return coinInfo.data;
        }
    } catch (error) {
        console.error("Error retrieving coin info from session:", error);
    }
    return null;
}

async function setCoinInfoToSession(coinId, data) {
    try {
        const sessionData = JSON.parse(sessionStorage.getItem('coinInfo')) || {};
        sessionData[coinId] = {
            data,
            timestamp: new Date().getTime(),
        };
        sessionStorage.setItem('coinInfo', JSON.stringify(sessionData));
    } catch (error) {
        console.error("Error setting coin info to session:", error);
    }
}

export async function getCoinInfo(coinId) {
    const cachedData = getCoinInfoFromSession(coinId);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        await setCoinInfoToSession(coinId, response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching coin info:", error);
        return null;
    }
}

function getCoinDataFromSession(currency, page, perPage) {
    try {
        const key = `coinData_${currency}_${page}_${perPage}`;
        const sessionData = JSON.parse(sessionStorage.getItem(key));
        const currentTime = new Date().getTime();

        if (sessionData && currentTime - sessionData.timestamp < SESSION_DURATION) {
            return sessionData.data;
        }
    } catch (error) {
        console.error("Error retrieving coin data from session:", error);
    }
    return null;
}

async function setCoinDataToSession(currency, page, perPage, data) {
    try {
        const key = `coinData_${currency}_${page}_${perPage}`;
        const sessionData = {
            data,
            timestamp: new Date().getTime(),
        };
        sessionStorage.setItem(key, JSON.stringify(sessionData));
    } catch (error) {
        console.error("Error setting coin data to session:", error);
    }
}

export async function getCoinData(currency, page = 1, perPage = 30) {
    const cachedData = getCoinDataFromSession(currency, page, perPage);
    if (cachedData) {
        return cachedData;
    }

    try {
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets?order=market_cap_desc&vs_currency=${currency}&per_page=${perPage}&page=${page}`);
        await setCoinDataToSession(currency, page, perPage, response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching coin data:", error);
        return [];
    }
}