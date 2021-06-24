const _ = require('lodash')
// Gets the priceHistory object of the cheapest source
const getDisplayPrice =  priceInfo => {
    latestPriceInfo = []
    for (key of Object.keys(priceInfo)) {
        const doc = priceInfo[key]
        latestPriceInfo.push(doc.priceHistory[doc.priceHistory.length - 1])
    }
    return _.minBy(latestPriceInfo, priceInfo => priceInfo.priceRange.minPrice)
}
// Formats the price of a price history object
const formatPriceInfo =  priceInfoSub => {
    if (priceInfoSub == null)
        return '$0'
    // Price info for a pack or productV2
    if (priceInfoSub.hasOwnProperty('minPrice')) {
        if(priceInfoSub.maxPrice && priceInfoSub.maxPrice != priceInfoSub.minPrice) {
            return `$${Math.round(priceInfoSub.minPrice*100) / 100} - $${Math.round(priceInfoSub.maxPrice*100) / 100}`
        }
        return `$${Math.round(priceInfoSub.minPrice*100) / 100}`
    }
    // Price info for a product
    if (priceInfoSub.priceRange.maxPrice && priceInfoSub.priceRange.maxPrice !== priceInfoSub.priceRange.minPrice) {
        return `<span>$${priceInfoSub.priceRange.minPrice} - $${priceInfoSub.priceRange.maxPrice}</span>`
    }
    return `$${priceInfoSub.priceRange.minPrice}`
}
// Currently only used for packs on main slideshow, maybe will also move to mobile versions for everything
const formatMinPrice = priceInfoSub => {
    if (priceInfoSub == null)
        return '$0'
    let suffix = ''
    if (priceInfoSub.hasOwnProperty('maxPrice'))
        suffix = '+'
    return `$${Math.round(priceInfoSub.minPrice*100) / 100}${suffix}`
}
const getLast = array => {
    if (array.length > 0)
        return array[array.length - 1]
    else 
        return null
}
const getFormattedPriceNoSplit = product => {
    if (product.hasOwnProperty('lowestPriceRange')) {
        return `$${Math.round(product.lowestPriceRange.minPrice*100) / 100}` 
    }
    if (product.hasOwnProperty('priceRange')) {
        return `$${Math.round(product.priceRange.minPrice*100) / 100}` 
    }
    return '$0'
}
const getFormattedMinPrice = (product) => {
    if (product.hasOwnProperty('lowestPriceRange')) {
        return formatPriceInfo(product.lowestPriceRange)
    }
    return formatPriceInfo(getDisplayPrice(product.priceInfo))
}

module.exports.getDisplayPrice = getDisplayPrice
module.exports.formatPriceInfo = formatPriceInfo
module.exports.getLast = getLast
module.exports.getFormattedMinPrice = getFormattedMinPrice 
module.exports.formatMinPrice = formatMinPrice
module.exports.getFormattedPriceNoSplit = getFormattedPriceNoSplit