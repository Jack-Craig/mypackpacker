$(window).on('load', () => {
    switch(window.location.pathname) {
        case '/pack':
            $('#pack-nav').addClass('selected')
            break
        case '/completed':
            $('#community-pack-nav').addClass('selected')
            break
        case '/user/packs':
            $('#user-pack-nav').addClass('selected')
            break
    }
})