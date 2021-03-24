$(window).on('load', () => {
    $('.data-delete-button').on('click', event => {
        const packID = $(event.target).attr('data-pack-id')
        const modal = $(`#pack-delete-modal-${packID}`)
        modal.removeClass('hidden')
    })
    $('.data-edit-button').on('click', event => {
        const packID = $(event.target).attr('data-pack-id')
        $.get('/user/packs/setmain/' + packID, ()=>window.location.href='/pack')
    })
    $('.data-edit-publish-button').on('click', event => {
        const packID = $(event.target).attr('data-pack-id')
        $.get('/user/packs/unpublish/' + packID, ()=>location.reload())
    })
    $('.data-publish-button').on('click', event => {
        const packID = $(event.target).attr('data-pack-id')
        window.location = '/user/packs/publish/' + packID
    })
    $('.title-input-form').on('submit', (event) => {
        const elem = $(event.target)
        const packID = elem.attr('data-pack-id')
        if (elem.val() === 'New Pack')
            elem.addClass('default-name')
        else {
            elem.removeClass('default-name')
        }
        const displayName = $(`#${packID}-title`).val()
        $.post('/user/packs/setname', {id: packID, displayName: displayName}, () => {
            $(`#${packID}-button`).text(displayName)
        })
    })
    $('.title-input').on('blur',event=>{
        const elem = $(event.target)
        const packID = elem.attr('data-pack-id')
        if (elem.val() === 'New Pack')
            elem.addClass('default-name')
        else {
            elem.removeClass('default-name')
        }
        const displayName = $(`#${packID}-title`).val()
        $.post('/user/packs/setname', {id: packID, displayName: displayName}, () => {
            $(`#${packID}-button`).text(displayName)
        })
    })
    $('.no-dont-delete').on('click', e => {
        $('.pack-delete-modal').addClass('hidden')
    })
    $('.yes-delete').on('click', e => {
        const pid = e.target.getAttribute('data-id')
        $.post('/user/packs/delete', {id: pid}, ()=>location.reload())
    })
})
