const registerButtons = () => {
    $('.add-to-pack').on('click', event => {
        const idToAdd = $(event.target).attr('id')
        $.get(`/pack/add/${idToAdd}`).done(() => {
            window.location = '/pack'
        })
    })
    const userCategoryUpdate = (event, isOwned) => {
        const gearId = $(event.target).attr('data-id')
        const data = {
            owned: isOwned ? [gearId] : [],
            saved: isOwned ? [] : [gearId]
        }
        if (event.target.checked)
            $.post('/user/gear/add', data).done()
        else {
            $.post('/user/gear/remove', data).done()
        }
    }
    $('.user-cat-saved').on('change', (e) => userCategoryUpdate(e, false))
    $('.user-cat-owned').on('change', (e) => userCategoryUpdate(e, true))
}

const reqAndRender = () => {
    const catId = window.location.pathname.substr(6)
    const hashQuery = window.location.hash.substr(1)
    $.ajax({
        method: 'get',
        url: `/pack/content/${catId}?${hashQuery}`
    }).done(r => {
        $('#category-body').html(r)
        registerButtons()
    })
}
reqAndRender()
$(window).on('hashchange', reqAndRender)

