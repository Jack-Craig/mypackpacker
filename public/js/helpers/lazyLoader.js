$(window).on('load', (event) => {
    // This is for a single image, a similar but different solution will have to be made for images that share sub-ids
    const lazyLoad = () => {
        $('.lazy-loaded-image').each((index, elem) => {
            const $elem = $(elem)
            const usp = new URLSearchParams()
            usp.set('cache', 6000)
            $.get(`/api/image/${$elem.attr('data-assoc-id')}/${$elem.attr('data-sub-id')}?${usp.toString()}`, data => {
                    $elem.attr('src', data.src)
                    $(window).trigger('lazy-image-loaded', [$elem[0]])
            })
        })
    }
    lazyLoad()
    $(window).on('lazyLoad', lazyLoad)
})