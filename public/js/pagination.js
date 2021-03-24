{
    const usp = new URLSearchParams(window.location.search)
    $('.pagination-controls a').each((idx, elem) => {
        const spAddition = elem.getAttribute('data-p')
        usp.set('page', spAddition)
        elem.setAttribute('href', `?${usp.toString()}`)
    })
}