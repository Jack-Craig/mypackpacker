$('.tab-header button').on('click', (e) => {
    const id = $(e.target).attr('data-ass-id')
    $('.pack-tab').addClass('hidden')
    $(`#${id}`).removeClass('hidden')
})
console.log(window.location.hash)
if (window.location.hash === '#upload') {
    $('.add-new-items-container').removeClass('hidden')
    $('.add-new-items-prompt').addClass('hidden')
}