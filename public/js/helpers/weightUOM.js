const setWeightInfo = (wId, newUOM) => {
    const weightE = $(wId)
    const iWeight = parseFloat(weightE.attr('data-base-weight'))
    weightE.text(UOM_ConvertTo(iWeight, 'g', newUOM))
}
$('.weight-uom-select').on('change', (e) => {
    const $el = $(e.target)
    const newUOM = $el.val()
    if ($el.attr('data-agear-id') === '*') {
        $('.weight-uom-select').not('[data-agear-id="*"]').each((idx, elem) => {
            const $el = $(elem)
            setWeightInfo(`#weight-${$el.attr('data-agear-id')}`, newUOM)
            $el.val(newUOM)
        })
        return
    }
    setWeightInfo(`#weight-${$el.attr('data-agear-id')}`, newUOM)
})