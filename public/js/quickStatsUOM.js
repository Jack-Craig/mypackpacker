// Do Once
const uom = document.getElementById('bulk-uom-select').value
const $wWeight = $('#worn-weight')
$wWeight.text(getDisplayWeight(parseFloat($wWeight.attr('data-base-weight')), 'g', uom))
const $bWeight = $('#base-weight')
$bWeight.text(getDisplayWeight(parseFloat($bWeight.attr('data-base-weight')), 'g', uom))
const $tWeight = $('#total-weight')
$tWeight.text(getDisplayWeight(parseFloat($tWeight.attr('data-base-weight')), 'g', uom))

$('#bulk-uom-select').on('change', (e) => {
    const uom = e.target.value
    const $wWeight = $('#worn-weight')
    $wWeight.text(getDisplayWeight(parseFloat($wWeight.attr('data-base-weight')), 'g', uom))
    const $bWeight = $('#base-weight')
    $bWeight.text(getDisplayWeight(parseFloat($bWeight.attr('data-base-weight')), 'g', uom))
    const $tWeight = $('#total-weight')
    $tWeight.text(getDisplayWeight(parseFloat($tWeight.attr('data-base-weight')), 'g', uom))
})