const [candleResponse, priceResponse] = await Promise.all([
    axios.get(`https://min-api.cryptocompare.com/data/v2/histominute?fsym=${coinSymbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=60`),
    axios.get(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinSymbol.toUpperCase()}&tsyms=${currency.toUpperCase()}`)
]);


const fetchCoinData = (coinSymbol, dateType, limit) => {
    let url = `https://min-api.cryptocompare.com/data/v2/${dateType}?fsym=${coinSymbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${limit}`
    
    return new Promise((resolve, reject)=>{
        axios.get(url).then((res)=>{
            if(res){
                resolve(res.data);
            }
            reject('no data found')
        })
    });
}

