const enforceNumericValue = (e) => {
    let targetV = e.target.value
    let targetN = parseFloat(targetV)
    if (!isNaN(targetN)) {
        e.target.value = targetN
        return
    }

    while (targetV.length) {
        targetV = targetV.slice(0, targetV.length - 1)
        console.log(targetV)
        targetN = parseFloat(targetV)
        if (!isNaN(targetN)) {
            e.target.value = targetN
            return
        }
    }
    e.target.value = 0

}
$('.numeric-input').on('change', enforceNumericValue).on('keyup', enforceNumericValue)