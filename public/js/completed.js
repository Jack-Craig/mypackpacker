const reqAndRender = () => {
    const hashQuery = window.location.hash.substr(1)
    $('#loading-notif').removeClass('hidden')
    $('#content-main').addClass('hidden')
    $.ajax({
        method: 'get',
        url: `/completed/content?${hashQuery}`
    }).done(r => {
        $('#loading-notif').addClass('hidden')
        $('#content-main').html(r).removeClass('hidden')
        $(window).trigger('lazyLoad')
    })
}
reqAndRender()
$(window).on('hashchange', reqAndRender)
