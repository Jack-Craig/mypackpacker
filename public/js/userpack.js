$(window).on('load', () => {
    $('#new-button').on('click', () => {
        $.post('/user/packs/new', data => {
            location.reload()
        })
    })
    $('.pack-set-active').on('click', event => {
        const targetID = $(event.target).attr('data-pack-id')
        $('.tab-selected').removeClass('tab-selected')
        $(event.target).addClass('tab-selected')
        $('.pack-tab').addClass('hidden')
        $(`#${targetID}`).removeClass('hidden')
    })
})