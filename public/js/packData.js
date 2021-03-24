$(window).on('load', () => {
    $('.tab-header button').on('click', (event) => {
        const pageId = $(event.target).attr('data-id')
        const packId = $(event.target).attr('data-pack-id')
        $(`.section-window.${packId}-container`).addClass('hidden')
        $(`#${pageId}_${packId}`).removeClass('hidden')
    })    
})