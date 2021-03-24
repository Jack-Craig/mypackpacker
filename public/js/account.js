$('.side-nav-button').on('click', (e) => {
    const $el = $(e.target)
    const target = $el.attr('data-id')
    if  (target) {
        $('.account-slice').addClass('hidden')
        $(`#${target}`).removeClass('hidden')
    }
})
$('#user-pref-form').on('submit', (e) => {
    e.preventDefault()
    const uom = $('#pref-uom').val()
    $.post('/user/preferences', {
        preferredUOM: uom
    }).done(()=>location.reload())
})
$('#account-delete').on('click', () => {
    $('#account-delete-modal').removeClass('hidden')
})
$('#do-not-delete').on('click', () => {
    $('#account-delete-modal').addClass('hidden')
})
$('#delete-button').on('click', () => {
    $.ajax({
        url: '/user',
        type: 'DELETE'
    }).done(()=>window.location = '/')
})