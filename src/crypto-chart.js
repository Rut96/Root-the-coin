let charts = {};

export function initChart(coinSymbol, initialCurrency, coinId) {
    const containerDiv = $('<div>', {
        id: `container-${coinSymbol}`,
        class: 'chart-container'
    });

    containerDiv.html(`
        <div class="price-change" id="price-change-${coinSymbol}"></div>
        <div class="chart" id="chart-${coinSymbol}"></div>
        <div class="chart-controls">
            <div class="control-group">
                <label for="time-option-${coinSymbol}">Time Frame</label>
                <select id="time-option-${coinSymbol}" class="time-option">
                    <option value="minute">Minutes</option>
                    <option value="hour">Hours</option>
                    <option value="day" selected>Days</option>
                </select>
            </div>
            <div class="control-group">
                <label for="limit-option-${coinSymbol}">Data Limit</label>
                <select id="limit-option-${coinSymbol}" class="limit-option">
                    <option value="30">30</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                </select>
            </div>
            <div class="control-group">
                <label for="currency-option-${coinSymbol}">Currency</label>
                <select id="currency-option-${coinSymbol}" class="currency-option">
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="ils">ILS</option>
                </select>
            </div>
        </div>
    `);

    $('#chartsContainer').append(containerDiv);
    containerDiv.find('.currency-option').val(initialCurrency);

    containerDiv.find('.time-option, .currency-option, .limit-option').on('change', () => updateChart(coinSymbol));

    const options = {
        series: [{
            data: []
        }],
        chart: {
            type: 'candlestick',
            height: 350,
            width: '100%',
        },
        title: {
            align: 'left'
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            tooltip: {
                enabled: true
            }
        }
    };

    charts[coinSymbol] = {
        chart: new ApexCharts($(`#chart-${coinSymbol}`)[0], options),
        id: coinId
    };
    charts[coinSymbol].chart.render();
    updateChart(coinSymbol);
    containerDiv.find('.time-option').val('minute');
}

export async function updateChart(coinSymbol) {
    if (!charts[coinSymbol] || !charts[coinSymbol].chart) {
        console.log(`Chart for ${coinSymbol} doesn't exist. Skipping update.`);
        return;
    }

    const container = $(`#container-${coinSymbol}`);
    if (container.length === 0) {
        console.log(`Container for ${coinSymbol} doesn't exist. Skipping update.`);
        return;
    }

    const timeOption = container.find('.time-option').val();
    const currency = container.find('.currency-option').val();
    const limit = container.find('.limit-option').val();


    try {
        let url;
        switch (timeOption) {
            case 'minute':
                url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=${coinSymbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${limit}`;
                break;
            case 'hour':
                url = `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${coinSymbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${limit}`;
                break;
            case 'day':
                url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${coinSymbol.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${limit}`;
                break;
        }

        const [candleResponse, priceResponse] = await Promise.all([
            $.ajax({url: url, method: 'GET'}),
            $.ajax({url: `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinSymbol.toUpperCase()}&tsyms=${currency.toUpperCase()}`, method: 'GET'})
        ]);

        const historicalDataArr = candleResponse.Data.Data;
        const priceData = priceResponse.RAW[coinSymbol.toUpperCase()][currency.toUpperCase()];

        const candleData = historicalDataArr.map((data) => ({
            x: new Date(data.time * 1000),
            y: [data.open, data.high, data.low, data.close]
        }));

        charts[coinSymbol].chart.updateSeries([{
            data: candleData
        }]);

        updatePriceChange(coinSymbol, priceData, currency);

    } catch (error) {
        console.error(`Error updating chart for ${coinSymbol}:`, error);
    }
}

function updatePriceChange(coinSymbol, priceData, currency) {
    const price = priceData.PRICE;
    const change = priceData.CHANGEPCT24HOUR;
    const priceChangeDiv = $(`#price-change-${coinSymbol}`);

    priceChangeDiv.html(`
        <span class="coin-symbol">${coinSymbol.toUpperCase()}</span>
        <span class="coin-price">${price.toFixed(2)} ${currency.toUpperCase()}</span>
        <span class="coin-change ${change >= 0 ? 'positive' : 'negative'}">${change.toFixed(2)}%</span>
    `);

    priceChangeDiv.attr('class', `price-change ${change >= 0 ? 'positive' : 'negative'}`);
}

export async function updateAllCharts(chosenCoins, currency) {
    if (chosenCoins.length === 0) {
        $('#chartsContainer').html(`
            <div class="no-charts-message">
                <img src="../assets/images/nocharts.webp" alt="No charts available" class="no-charts-image">
                <div class="no-charts-info">
                    <h2>No Coins Selected</h2>
                    <p>Choose some coins to see their live charts here!</p>
                </div>
            </div>
        `);
    } else {
        $('.no-charts-message').remove();
        for (const coin of chosenCoins) {
            if (charts[coin.symbol] && charts[coin.symbol].chart) {
                await updateChart(coin.symbol);
            } else {
                console.log(`Initializing chart for ${coin.symbol}`);
                initChart(coin.symbol, currency, coin.id);
                await updateChart(coin.symbol);
            }
        }
    }
}
export function removeChart(coinSymbol) {
    if (charts[coinSymbol]) {
        charts[coinSymbol].chart.destroy();
        delete charts[coinSymbol];
        $(`#container-${coinSymbol}`).remove();
    }
}

export function startChartUpdates(chosenCoins, currency) {
    return setInterval(() => {
        updateAllCharts(chosenCoins, currency);
    }, 2000);
}