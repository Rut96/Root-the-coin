import { getCoinData, getCoinInfo } from './crypto-api.js';
import { drawCoinUI, filterCoins, toggleView, setupPagination, coinsPerPage, currentPage,totalCoins, drawPagination } from './crypto-ui.js';
import { updateAllCharts, startChartUpdates, removeChart, initChart } from './crypto-chart.js';
import { showOverlay } from './overlay.js';


$(() => {
    let currency = "usd";
    let coinData = [];
    let chosenCoins = [];
    const maxChosenCoins = 5;
    let chartUpdateInterval;

    $('#searchBox').on('keyup', function () {
        const searchTerm = $(this).val();
        const filteredCoins = filterCoins(coinData, searchTerm);
        drawCoinUI(filteredCoins, chosenCoins, currency);
    });

    $('#currency').on('change', async function () {
        currency = $(this).val();
        await updateCoinList(currency, currentPage);
        updateAllCharts(chosenCoins, currency);
    });

    $('#clearAllButton').on('click', function() {
        chosenCoins.forEach(coin => {
            $(`#toggle-${coin.id}`).prop('checked', false);
            $(`#${coin.id}`).css('border-color', '');
            removeChart(coin.symbol);
        });
        chosenCoins = [];
        stopChartUpdates();
        updateAllCharts(chosenCoins, currency);
        drawCoinUI(coinData, chosenCoins.map(c => c.id), currency);
    });


    $(document).on('click', '.showInfo', async function () {
        const coinId = $(this).attr('id').replace('btn-', '');
        const coinCard = $(`#${coinId}`);
        const loader = $(`.crypto-loader-${coinId}`);

        if (!coinCard.hasClass('flipped')) {
            coinCard.addClass('flipped');

            loader.show();
            
            $(this).prop('disabled', true);
            const coinInfo = await getCoinInfo(coinId);
            
            loader.hide();
            
            $(this).prop('disabled', false);

            if (coinInfo) {
                $(`#coinProps-${coinId}`).html(`
                    <p class="price">${currency.toUpperCase()}  ${coinInfo.market_data.current_price[currency].toFixed(2)}</p>
                    <p class="change ${coinInfo.market_data.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                        ${coinInfo.market_data.price_change_percentage_24h.toFixed(2)}%
                    </p>
                `);
            } else {
                alert('Failed to fetch coin information. Please try again.');
                coinCard.removeClass('flipped');
            }
        }
    });

    $(document).on('click', '.closeInfo', function () {
        const coinId = $(this).attr('id').replace('close-btn-', '');
        $(`#${coinId}`).removeClass('flipped');
    });

    $(document).on('change', '.toggle-input', function () {
        const coinId = $(this).attr('id').replace('toggle-', '');
        const coinBox = $(`#${coinId}`);
        const checked = this.checked;
        const coin = coinData.find(c => c.id === coinId);

        if (checked) {
            if (chosenCoins.length < maxChosenCoins) {
                chosenCoins.push({ id: coinId, symbol: coin.symbol });
                coinBox.css('border-color', '#3498db');
                initChart(coin.symbol, currency, coinId);
                updateAllCharts(chosenCoins, currency);
            } else {
                this.checked = false;
                showOverlay(
                    "Maximum Coins Reached",
                    `You can select up to ${maxChosenCoins} coins for comparison. To add ${coin.symbol.toUpperCase()}, please choose one to remove:`,
                    chosenCoins.map(c => c.symbol.toUpperCase()),
                    (selectedCoin) => {
                        const index = chosenCoins.findIndex(c => c.symbol.toUpperCase() === selectedCoin);
                        if (index !== -1) {
                            const removedCoin = chosenCoins.splice(index, 1)[0];
                            $(`#toggle-${removedCoin.id}`).prop('checked', false);
                            $(`#${removedCoin.id}`).css('border-color', '');
                            removeChart(removedCoin.symbol);
                        }
                        chosenCoins.push({ id: coinId, symbol: coin.symbol });
                        $(this).prop('checked', true);
                        coinBox.css('border-color', '#3498db');
                        updateAllCharts(chosenCoins, currency);
                    }
                );
            }
        } else {
            const index = chosenCoins.findIndex(c => c.id === coinId);
            if (index !== -1) {
                const removedCoin = chosenCoins.splice(index, 1)[0];
                coinBox.css('border-color', '');
                removeChart(removedCoin.symbol);
                updateAllCharts(chosenCoins, currency);
            }
        }
    });

    $('#homeLink').on('click', function (e) {
        e.preventDefault();
        toggleView('home');
        stopChartUpdates();
    });


    $('#liveServerLink').on('click', function (e) {
        e.preventDefault();
        toggleView('liveServer');
        startChartUpdatesIfNeeded();
    });

    function startChartUpdatesIfNeeded() {
        if (chosenCoins.length > 0 && !chartUpdateInterval) {
            chartUpdateInterval = startChartUpdates(chosenCoins, currency);
        }
    }

    function stopChartUpdates() {
        if (chartUpdateInterval) {
            clearInterval(chartUpdateInterval);
            chartUpdateInterval = null;
        }
    }

    async function updateCoinList(currency, page) {
        coinData = await getCoinData(currency, page, coinsPerPage);
        drawCoinUI(coinData, chosenCoins.map(c => c.id), currency);
        const totalPages = Math.ceil(totalCoins / coinsPerPage);
        drawPagination(page, totalPages);
    }


    async function init() {
        await updateCoinList(currency, currentPage);
        setupPagination(currency, updateCoinList);
        toggleView('home');
    }

    init();
});