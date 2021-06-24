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
    elem.noUiSlider.on('change', e => $('#filter-form').submit())
})
$('#filter-form input, #filter-form select').on('change', e => $('#filter-form').submit())

{

    const hashParams = new URLSearchParams('?' + window.location.hash.slice(1))
    $('#category-sort').val(hashParams.get('sort'))
    $('.filter-field').each((idx, elem) => {
        if (!hashParams.has(elem.getAttribute('val-store-key'))) {
            return
        }
        const paramVal = hashParams.get(elem.getAttribute('val-store-key'))
        switch (elem.getAttribute('data-field-type')) {
            case 'cb':
                break
            case '2ws':
                const [min, max] = paramVal.split(',')
                const slider = elem.noUiSlider
                let unencMin = min
                let unencMax = max
                if (elem.hasAttribute('data-uom')) {
                    const uom = elem.getAttribute('data-uom')
                    unencMin = UOM_ConvertTo(parseFloat(min), 'g', uom)
                    unencMax = UOM_ConvertTo(parseFloat(max), 'g', uom)
                }
                elem.setAttribute('unenc-min', unencMin)
                elem.setAttribute('unenc-max', unencMax)
                slider.set([unencMin, unencMax])
                break
            case 'ms':
                const selectedVals = new Set(paramVal.split(','))
                const $e = $(elem)
                const checkBoxes = $e.find('> li > input')
                checkBoxes.each((idx2, cb) => {
                    let v = cb.getAttribute('value')

                    if (v === '*')
                        cb.checked = false
                    if (selectedVals.has(v)) {
                        cb.checked = true
                    }
                })
                break
            case 'tex':
                elem.setAttribute('value', paramVal)
                break
        }
    })
}