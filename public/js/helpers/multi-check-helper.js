// Load from url params
{
    const urlParams = new URLSearchParams(window.location.search)
    $('.multi-select-list').each((idx, elem) => {
        const vsKey = elem.getAttribute('val-store-key')
        const $e = $(elem)
        if (!urlParams.has(vsKey)) {
            $e.find('.select-all').prop('checked', true)
            return
        }
        const vals = urlParams.get(vsKey).split(',')
        $e.find('.select-all').prop('checked', false)
        for (const val of vals) {
            $e.find(`input[value="${val}"]`).prop('checked', true)
        }
    })
}
// If all selected clear
$('.multi-select-list input').on('change', e => {
    if (e.target.checked && e.target.value === '*') {
        $(`#${e.target.getAttribute('val-store-key')} input`).prop('checked', false)
        e.target.checked = true
    } else if (e.target.checked) {
        $(`#${e.target.getAttribute('val-store-key')} input.select-all`).prop('checked', false)
    }
})
$('.multi-select-see-more').on('click', e => {
    const elem = e.currentTarget
    const pId = elem.getAttribute('data-ref-id')
    $(`#${pId} > `).removeClass('hidden')
    document.getElementById(`see-less-${pId}`).classList.remove('hidden')
    elem.classList.add('hidden')
})
$('.multi-select-see-less').on('click', e => {
    const elem = e.currentTarget
    const pId = elem.getAttribute('data-ref-id')
    $(`#${pId} >`).each((idx, elem) => {
        if (idx > 5)
            elem.classList.add('hidden')
    })
    document.getElementById(`see-more-${pId}`).classList.remove('hidden')
    elem.classList.add('hidden')
})