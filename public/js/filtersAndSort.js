$('#filter-form').on('submit', event => {
    event.preventDefault()
    const urlParams = new URLSearchParams()
    const sortVal = $('#category-sort').val()
    if (sortVal === 'nosort') {
        urlParams.delete('sort')
    } else {
        urlParams.set('sort', sortVal)
    }
    $('.filter-field').each((idx, elem) => {
        const vsKey = elem.getAttribute('val-store-key')
        switch (elem.getAttribute('data-field-type')) {
            case 'cb':
                if (elem.checked)
                    urlParams.set(vsKey, 1)
                else
                    urlParams.delete(vsKey)
                break
            case '2ws':
                let unencMin = elem.getAttribute('unenc-min')
                let unencMax = elem.getAttribute('unenc-max')
                if (unencMin === elem.getAttribute('min') && unencMax == elem.getAttribute('max'))
                    break
                if (elem.hasAttribute('data-uom')) {
                    const uom = elem.getAttribute('data-uom')
                    unencMin = '' + UOM_ConvertTo(parseFloat(unencMin), uom, 'g')
                    unencMax = '' + UOM_ConvertTo(parseFloat(unencMax), uom, 'g')
                }
                urlParams.set(vsKey, `${unencMin},${unencMax}`)
                break
            case 'ms':
                const $e = $(elem)
                const checkBoxes = $e.find('> li > input')
                let selected = []
                checkBoxes.each((idx, elem2) => {
                    if (elem2.checked)
                        selected.push(elem2.value)
                })
                const v = selected.join(',')
                if (v === '*')
                    break
                if (v)
                    urlParams.set(vsKey, v)
                break
            case 'tex':
                if (elem.value)
                    urlParams.set(vsKey, elem.value)
        }
    })
    // Request and render the correct stuff
    window.location.hash = urlParams.toString()
})
$('#filter-form .double-slider').each((idx, elem) => {
    elem.noUiSlider.on('change', e=>$('#filter-form').submit())
})
$('#filter-form input, #filter-form select').on('change', e=>$('#filter-form').submit())