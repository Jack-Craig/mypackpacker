{
    let numSelected = {}
    $('.select-all').on('change', e => {
        const targetType = e.target.getAttribute('data-type')
        numSelected[targetType] = 0
        $('.subcat-edit-input').each((idx, elem) => {
            elem.checked = e.target.checked
            if (elem.checked)
                numSelected[targetType]++
        })
        if (numSelected[targetType] > 0) {
            $(`.submit-remove-request[data-type="${targetType}"]`).removeClass('hidden')
        } else {
            $(`.submit-remove-request[data-type="${targetType}"]`).addClass('hidden')
        }
    })
    $('.subcat-edit-input').on('change', e => {
        const targetType = e.target.getAttribute('data-type')
        if (!numSelected.hasOwnProperty(targetType))
            numSelected[targetType] = 0
        if (e.target.checked)
            numSelected[targetType]++
        else if (numSelected[targetType] > 0)
            numSelected[targetType]--

        console.log(numSelected[targetType], targetType)

        if (numSelected[targetType] > 0) {
            $(`.submit-remove-request[data-type="${targetType}"]`).removeClass('hidden')
        } else {
            $(`.submit-remove-request[data-type="${targetType}"]`).addClass('hidden')
        }
    })

    $('.submit-remove-request').on('click', (e) => {
        let toRemove = []
        $('input.subcat-edit-input').filter(':checked').each((idx, e) => {
            toRemove.push($(e).attr('data-ref-id'))
        })
        const classification = e.target.getAttribute('data-type')
        let data = {
            owned: classification === 'owned' ? toRemove : [],
            saved: classification !== 'owned' ? toRemove : []
        }
        $.post('/user/gear/remove', data).done(() => location.reload())
    })
}
