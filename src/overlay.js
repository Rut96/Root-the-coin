let overlayCallback = null;

export function showOverlay(title, message, choices, callback) {
    $('#overlayTitle').text(title);
    $('#overlayMessage').text(message);
    
    const choicesHtml = choices.map(choice => 
        `<div class="choice-container">
            <input type="radio" id="${choice}" name="coinChoice" value="${choice}">
            <label for="${choice}">${choice}</label>
        </div>`
    ).join('');
    
    $('#overlayChoices').html(choicesHtml);
    $('#coinOverlay').fadeIn(300);
    
    overlayCallback = callback;
}

export function hideOverlay() {
    $('#coinOverlay').fadeOut(300);
}

$(document).ready(() => {
    $('#overlayConfirm').on('click', () => {
        const selectedCoin = $('input[name="coinChoice"]:checked').val();
        if (selectedCoin && overlayCallback) {
            overlayCallback(selectedCoin);
        }
        hideOverlay();
    });

    $('#overlayClose').on('click', hideOverlay);

    $('#coinOverlay').on('click', (e) => {
        if (e.target === e.currentTarget) {
            hideOverlay();
        }
    });

    $(document).on('mouseenter', '.choice-container', function() {
        $(this).addClass('hover');
    }).on('mouseleave', '.choice-container', function() {
        $(this).removeClass('hover');
    });
});