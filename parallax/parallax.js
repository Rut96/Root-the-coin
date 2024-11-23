$(document).ready(() => {
    const text = $('#text');
    const coinsBackImg = $('#coinsBackImg');
    const coinContainer = $('#coinContainer');
    const header = $('header');

    const coinCount = 30;
    const parallaxStrength = 0.5; 

    // coins with depth
    for (let i = 0; i < coinCount * 2; i++) {
        const $coin = $('<img>', {
            src: `./../assets/images/coin${Math.floor(Math.random() * 4) + 1}.png`,
            class: 'coin'
        });
        const depth = Math.random();
        const scale = 0.5 + depth * 0.5;
        $coin.css({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `scale(${scale})`,
            opacity: 0.5 + depth * 0.5
        });
        $coin.data('depth', depth);
        $coin.data('initialTop', parseFloat($coin.css('top')));
        coinContainer.append($coin);
    }

    let ticking = false;

    const updateParallax = () => {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();

        // parallax for text
        text.css('transform', `translate(-50%, ${-50 + scrollTop * 0.2}%)`);

        // parallax for background
        coinsBackImg.css('transform', `translateY(${scrollTop * 0.1}px)`);

        // parallax for coins
        $('.coin').each((index, coin) => {
            const $coin = $(coin);
            const depth = $coin.data('depth');
            const initialTop = $coin.data('initialTop');
            const yMovement = scrollTop * (depth * parallaxStrength);
    
            let newY = initialTop + yMovement;
    
            if (newY > windowHeight) {
                newY = -$coin.height();
                $coin.css({
                    top: newY + 'px',
                    left: Math.random() * 100 + '%'
                });
                $coin.data('initialTop', newY);
            }
    
            $coin.css('transform', `translateY(${yMovement}px) scale(${0.5 + depth * 0.5})`);
        });

        if (scrollTop > 50) {
            header.addClass('scrolled');
        } else {
            header.removeClass('scrolled');
        }

        ticking = false;
    };

    $(window).on('scroll resize', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    updateParallax();
});