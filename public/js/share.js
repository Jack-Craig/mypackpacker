$('.share-pack-button').on('click', e => {
    const target = e.currentTarget.getAttribute('data-mod-id')
    $('#' + target).removeClass('hidden')
})
$('.share-pack-cancel').on('click', e => {
    const target = e.currentTarget.getAttribute('data-mod-id')
    $('#' + target).addClass('hidden')
    $('.modal-message').css('opacity', 0)
})
$('.share-input').on('focus', e => {
    e.target.select()
})
$('.copy-share').on('click', e => {
    const targetId = e.currentTarget.getAttribute('data-mod-id')
    const pId = targetId.split('copy-')[1]
    document.getElementById(targetId).select()
    document.execCommand('copy')
    const notifElem = $('#notif-' + pId)
    notifElem.animate({
        opacity: 1
    }, 250, () => {
        setTimeout(()=>notifElem.animate({ opacity: 0 }, 250), 5000)
    })
})