const packId = $('#packAnalytics').attr('data-target-pack')
const pUOM = $('#packAnalytics').attr('data-puom')
proms = [$.get(`/api/packData/${packId}`), $.get(`/api/categories`)]
Promise.all(proms).then(d => {
    [pack, catData] = d
    if (!pack.hasOwnProperty('build'))
        return
    const packData = pack.build
    let labelObj = {}
    for (const cat of catData) {
        labelObj[cat._id] = cat.displayName
    }
    let weightSum = pack.totalWeight
    let priceSum = Math.floor(pack.priceRange.minPrice*100)/100
    let catPrices = []
    let catWeights = []
    for (const key of Object.keys(packData)) {
        const cat = packData[key]
        let catCostSum = 0
        let catWeightSum = 0

        for (const gear of cat) {
            if (gear.hasOwnProperty('lowestPriceRange'))
                catCostSum += gear.lowestPriceRange.minPrice
            else
                catCostSum += 1 // TODO: Implement getminprice helper
            catWeightSum += UOM_ConvertTo(gear.productInfo.weight, 'g', pUOM)
        }
        if (catCostSum > 0)
            catPrices.push([catCostSum, labelObj[key]])
        if (catWeightSum > 0)
            catWeights.push([catWeightSum, labelObj[key]])
    }
    catPrices.sort((a, b) => -a[0] + b[0])
    catWeights.sort((a, b) => -a[0] + b[0])

    let removedSum = 0
    for (let i = 9; i < catPrices.length; i++) {
        removedSum += catPrices[i][0]
    }
    catPrices.splice(9, 9e9)
    if (removedSum > 0) {
        catPrices.push([removedSum, 'Other'])
    }

    let removedWeightSum = 0
    for (let i = 9; i < catWeights.length; i++) {
        removedWeightSum += catWeights[i][0]
    }

    catWeights.splice(9, 9e9)
    if (removedWeightSum > 0) {
        catWeights.push([removedWeightSum, 'Other'])
    }

    let weightVals = []
    let weightLabels = []
    for (const pair of catWeights) {
        weightVals.push(pair[0])
        weightLabels.push(pair[1])
    }

    let priceVals = []
    let priceLabels = []
    for (const pair of catPrices) {
        priceVals.push(pair[0])
        priceLabels.push(pair[1])
    }

    data_cost = {
        labels: priceLabels,
        datasets: [{
            backgroundColor: ['#F8C471', '#CD6155', '#AF7AC5', '#F4D03F', '#5499C7', '#EC7063', '#48C9B0', '#5DADE2', '#A569BD', '#7DDF64'],
            data: priceVals
        }
        ]
    }
    data_weight = {
        labels: weightLabels,
        datasets: [{
            backgroundColor: ['#F8C471', '#CD6155', '#AF7AC5', '#F4D03F', '#5499C7', '#EC7063', '#48C9B0', '#5DADE2', '#A569BD', '#7DDF64'],
            data: weightVals
        }
        ]
    }
    options = {
        responsive: true,
        //zoomOutPercentage: 40,
        maintainAspectRatio: true,
        aspectRatio: 1,
        //tooltips: false,
        plugins: {
            legend: false,
            labels:{
                precision:2,
                fontColor: '#FFFFF',
                position: 'outside',
                overlap: false,
                arc: true
            }
            
        },
    }
    new Chart(document.getElementById('price-chart').getContext('2d'), {
        type: 'doughnut',
        data: data_cost,
        options: {
            ...options,
            elements: {
                center: {
                    text: `Price\n$${priceSum}`,
                    fontStyle: 'Poppins',
                }
            }
        }
    })
    new Chart(document.getElementById('weight-chart').getContext('2d'), {
        type: 'doughnut',
        data: data_weight,
        options: {
            ...options,
            elements: {
                center: {
                    text: `Weight\n${getDisplayWeight(weightSum, 'g', pUOM)}`, // TODO: UOM CONV
                    fontStyle: 'Poppins'
                }
            },
        }
    })
})
