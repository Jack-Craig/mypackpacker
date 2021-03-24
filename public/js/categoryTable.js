$('.add-custom-gear').on('click', e => {
    $('.add-custom-gear-form .cell-selector').removeClass('hidden')
    $(e.target).addClass('hidden')
})

// TOOD: Use data attributes to select the inputs from THIS pack
// Probs wont come up in practice bc when packs are shwon side by side they are not editable
$('.remove-item').on('click', event => {
    const $e = $(event.target)
    const itemId = $e.attr('data-id')
    const parentRow = $e.parent().parent()
    $.get(`/pack/remove/${itemId}`).done(()=>{
        parentRow.animate({opacity: 0}, ()=>parentRow.remove())
    })
})
const userCategoryUpdate = (event, isOwned) => {
    const gearId = $(event.target).attr('data-id')
    const data = {
        owned: isOwned ? [gearId] : [],
        saved: isOwned ? [] : [gearId]
    }
    if (event.target.checked)
        $.post('/user/gear/add',data).done()
    else {
        $.post('/user/gear/remove',data).done()
    }
}
$('.user-cat-saved').on('change', (e) => userCategoryUpdate(e, false))
$('.user-cat-owned').on('change', (e) => userCategoryUpdate(e, true))

$('#select-all-saved').on('change', (e) => {
    const shouldCheck = e.target.checked
    let idsToUpdate = []
    $('.user-cat-saved').each((idx, elem) => {
        elem.checked = shouldCheck
        idsToUpdate.push(elem.getAttribute('data-id'))
    })
    if (shouldCheck)
        $.post('/user/gear/add',{saved:idsToUpdate,owned:[]}).done()
    else 
        $.post('/user/gear/remove',{saved:idsToUpdate,owned:[]}).done()
})
$('#select-all-owned').on('change', (e) => {
    const shouldCheck = e.target.checked
    let idsToUpdate = []
    $('.user-cat-owned').each((idx, elem) => {
        elem.checked = shouldCheck
        idsToUpdate.push(elem.getAttribute('data-id'))
    })
    if (shouldCheck)
        $.post('/user/gear/add',{owned:idsToUpdate,saved:[]}).done()
    else 
        $.post('/user/gear/remove',{owned:idsToUpdate,saved:[]}).done()
})

$('.add-custom-gear-cancel').on('click', e => {
    $('.add-custom-gear-form .cell-selector').addClass('hidden').find('*').val('')
    $('.add-custom-gear').removeClass('hidden')
})

$('.cat-to-main').on('click', e => {
    e.preventDefault()
    $.get(`/user/packs/setmain/${e.target.getAttribute('data-pack-id')}`).done(window.location = e.target.getAttribute('href'))
})