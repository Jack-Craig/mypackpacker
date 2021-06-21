{
    $('.pagination-action').on('click', e => {
        const elem = e.target
        const usp = new URLSearchParams(window.location.hash)
        const spAddition = elem.getAttribute('data-p')
        usp.set('page', spAddition)
        window.location.hash = usp.toString()
    })
}