const { initialize } = require("passport");

const UOM_TO_BASE = { // convert uom to grams
    g: 1,
    kg: 1000,
    lb: 453.592,
    oz: 28.3495,
}
const BASE_TO_UOM = { // convert grams to uom
    g: 1,
    kg: .001,
    lb: 0.00220462,
    oz: 0.035274
}


const UOM_ConvertTo = (initial, initialUOM, transferUOM) => {
    if (isNaN(initial))
        return 0;
    if (initialUOM == undefined)
        initialUOM = 'lb'
    if (transferUOM == undefined)
        transferUOM = 'lb'
    let w
    if (initialUOM === transferUOM) {
        w = initial
    } else {
        w = initial * UOM_TO_BASE[initialUOM] * BASE_TO_UOM[transferUOM]
    }
    f = 1000
    if (w > 10)
        f = 100
    if (w > 100)
        f = 10
    return Math.floor((w * f)) / f
}
const getDisplayWeight = (initial, initialUOM, transferUOM) => {
    if (transferUOM == undefined)
        transferUOM = 'lb'
    if (initialUOM == undefined)
        initialUOM = 'lb'
    const nVal = UOM_ConvertTo(initial, initialUOM, transferUOM)

    return `${nVal}${transferUOM}`
}

module.exports.UOM_ConvertTo = UOM_ConvertTo
module.exports.getDisplayWeight = getDisplayWeight