const reqAndRender = () => {
    const hashQuery = window.location.hash.substr(1)
    $.ajax({
        method: 'get',
        url: `/completed/content?${hashQuery}`
    }).done(r => {
        $('#content-main').html(r)
        $(window).trigger('lazyLoad')
    })
}
reqAndRender()
$(window).on('hashchange', reqAndRender)
