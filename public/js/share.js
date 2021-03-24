$('.share-pack-button').on('click', e => {
    $('#share-modal').removeClass('hidden')
})
$('#share-pack-cancel').on('click', e => {
    $('#share-modal').addClass('hidden')
})
$('#share-pack-input').on('focus', e => {
    e.target.select()
})
$('#copy-share').on('click', e=> {
    const inpE = document.getElementById('share-pack-input')
    inpE.select()
    document.execCommand('copy')
})