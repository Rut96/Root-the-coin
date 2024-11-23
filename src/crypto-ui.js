export const coinsPerPage = 32;
export let currentPage = 1;
export const totalCoins = 100;

export function drawCoinUI(coinData, chosenCoinIds, currency) {
    let html = ``;
    const coinList = $("#coinList");
    coinList.empty();

    if (coinData.length === 0) {

        let imgHtml = `
            <div class="no-coins-message">
                <img src="/../assets/images/coin-not-found.webp" alt="No coins found" class="no-coins-image">
                <div class="no-coins-info">
                    <h2>No Coins Found</h2>
                    <p>We couldn't find any coins matching your search criteria. Please try adjusting your search or check back later for updates.</p>
                </div>
            </div>`;
        coinList.html(imgHtml);
        return;
    }

    coinData.forEach(coin => {
        const isChecked = chosenCoinIds.includes(coin.id) ? "checked" : "";
        html += `
            <div class="coin-card" id="${coin.id}">
                <div class="coin-card-inner">
                    <div class="coin-card-front">
                        <div class="coin-info">
                            <img src="${coin.image}" alt="${coin.name}" />
                            <div>
                                <h2>${coin.symbol.toUpperCase()}</h2>
                                <p>${coin.name}</p>
                            </div>
                            <div class="toggle-wrapper">
                                <label class="toggle-switch">
                                    <input type="checkbox" class="toggle-input" id="toggle-${coin.id}" ${isChecked}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <button class="showInfo" id="btn-${coin.id}">Open Info</button>
                    </div>
                    <div class="coin-card-back">
                        <div id="coinProps-${coin.id}">
                            <p class="price">${currency.toUpperCase()} ${coin.current_price.toFixed(2)}</p>
                            <p class="change ${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}">
                                ${coin.price_change_percentage_24h.toFixed(2)}%
                            </p>
                        </div>
                        <div class="crypto-loader crypto-loader-${coin.id}" style="display: none;">
                            <div class="loader-coin"></div>
                        </div>
                        <button class="closeInfo" id="close-btn-${coin.id}">Close Info</button>
                    </div>
                </div>
            </div>
        `;
    });
    coinList.html(html);
}

export function drawPagination(currentPage, totalPages) {
    let paginationHtml = '<div class="pagination">';
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationHtml += '</div>';

    $("#paginationContainer").html(paginationHtml);
}

export function setupPagination(currency, updateFunction) {
    $(document).on('click', '.page-btn', async function () {
        currentPage = parseInt($(this).data('page'));
        await updateFunction(currency, currentPage);
    });
}

export function filterCoins(coinData, searchTerm) {
    return coinData.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
}

export function toggleView(view) {
    if (view === 'home') {
        $('#cryptoContainer').show();
        $('#liveServerContainer').hide();
        $('#homeLink').addClass('active');
        $('#liveServerLink').removeClass('active');
    } else if (view === 'liveServer') {
        $('#cryptoContainer').hide();
        $('#liveServerContainer').show();
        $('#homeLink').removeClass('active');
        $('#liveServerLink').addClass('active');
    }
}