const onUOMSelectChange = e => {
    const $el = $(e.target)
    const newUOM = $el.val()
    const idx = $el.attr('data-index')
    if (idx) {
        const targetInput = $(`#container-weight-${idx} > input`)
        setWeightData(targetInput, $el, newUOM)
    } else {
        setWeightData($('#container-weight- > input'), $el, newUOM)
        let i = 0
        let targetContainer = $(`#container-weight-${i}`)
        while (targetContainer.length) {
            const targetSelect = $(`#container-weight-${i} > select`)
            targetSelect.val(newUOM)
            setWeightData($(`#container-weight-${i} > input`), targetSelect, newUOM)
            targetContainer = $(`#container-weight-${++i}`)
        }
    }
}

const clearRow = $e => {
    $e.find('input,select').val('')
}

const addRow = () => {
    const $table = $('#add-gear-table')
    const $rows = $table.find('tbody tr')
    const numRows = $rows.length
    const dUOM = $('.add-gear-uom[data-index=""]').val()
    const firstRowHtml = $rows[0].outerHTML
    const $firstRowHtml = $(firstRowHtml) // Copies into new jquery object
    clearRow($firstRowHtml)
    $firstRowHtml.attr('id', `new-gear-table-row-${numRows}`)
    $firstRowHtml.find('.table-sidebar').text('')
    $firstRowHtml.find('input,select').each((idx, e) => {
        if (e.classList.contains('add-gear-uom')) {
            e.setAttribute('data-index', numRows)

            e.value = dUOM
            return
        }
        const $e = $(e)
        const eId = $e.attr('id')
        const lastIdx = eId.lastIndexOf('-')
        $e.attr('id', eId.slice(0, lastIdx + 1) + numRows)
    })
    $firstRowHtml.find('.weight-container').attr('id', `container-weight-${numRows}`)
    $firstRowHtml.find('.weight-container select').on('change', onUOMSelectChange)
    $($firstRowHtml).insertAfter(`#new-gear-table-row-${numRows - 1}`)
}
const isRowEmpty = $row => {
    let isEmpty = true
    $row.find('> >').each((idx, inputE) => {
        if (inputE.type !== 'checkbox') {
            if (inputE.value !== '')
                isEmpty = false
            return
        }
    })
    return isEmpty
}
const setSelectedValue = (baseId, value, isCheckbox = false) => {
    let i = 0
    let targetElem = $(`#${baseId}-${i}`)
    while (targetElem.length) {
        if (baseId === 'bulk-edit-selected') {
            $(`#bulk-edit-selected-${i}`).prop('checked', value)
            targetElem = $(`#${baseId}-${++i}`)
            continue
        }

        if ($(`#bulk-edit-selected-${i}`).is(':checked')) {
            if (isCheckbox)
                targetElem.prop('checked', value)
            else {
                targetElem.val(value)
                if (baseId === 'new-gear-weight') {
                    const uomSelect = $(`#container-weight-${i} > select`)
                    const newUOM = $('.add-gear-uom[data-index=""]').val()
                    uomSelect.attr('data-prevUOM', newUOM)
                    uomSelect.val(newUOM)
                }
            }
        }
        targetElem = $(`#${baseId}-${++i}`)
    }
}
const packStackCatConv = {
    'Pack': 'backpacks',
    'Shelter': 'tents',
    'Sleep System': 'sleeping-bags',
    'Water System': 'water-treatment',
    'Cookware': 'pots-and-pans',
    'Toiletries': 'other',
    'Electronics': 'navigation',
    'Clothing': 'insulation-layers',
    'Footwear': 'boots',
    'Consumables': 'consumable',
    'Misc.': 'custom'
}
$('#import-elem').on('change', (e) => {
    const reader = new FileReader();
    let importedGear = []
    let convertLine
    reader.onload = (e) => {
        const lines = e.target.result.split('\n') // TODO: SPLIT USING UNIVERSAL ENDL
        const categoriesString = lines[0]
        const categoriesList = categoriesString.split(',')
        delete lines[0]
        if (categoriesString === 'name,product_name,category,weight,weight_unit,price') {
            // We know we are working with PackStack
            convertLine = line => {
                let doc = {}
                const dataList = line.split(',')
                for (let i = 0; i < categoriesList.length; i++) {
                    const dataPoint = dataList[i]
                    const cat = categoriesList[i]
                    switch (cat) {
                        case 'name':
                            break
                        case 'product_name':
                            doc.displayName = dataPoint
                            break
                        case 'category':
                            doc.categoryID = packStackCatConv[dataPoint.normalize()]
                            break
                        case 'weight':
                            doc.productInfo = { weight: parseFloat(dataPoint) } // TODO - convert to standard UOM (g)
                        case 'weight_unit':
                            break // TODO - convert to standard UOM (g) 
                        case 'price':
                            doc.lowestPriceRange = { minPrice: parseFloat(dataPoint), maxPrice: null }
                            break
                    }
                }
                return [doc, 1]
            }
        } else if (categoriesString === 'Item Name,Category,desc,qty,weight,unit,url,price,worn,consumable') {
            convertLine = line => {
                let qty = 0
                let doc = { productInfo: {}, lowestPriceRange: {} }
                const dataList = line.split(',')
                for (let i = 0; i < categoriesList.length; i++) {
                    const dp = dataList[i]
                    const cat = categoriesList[i]
                    switch (cat) {
                        case 'Item Name': doc.displayName = dp; break
                        case 'Category': doc.categoryId = undefined; break
                        case 'desc': doc.productInfo.description = dp; break
                        case 'qty': qty = parseInt(dp); break
                        case 'weight': doc.productInfo.weight = parseFloat(dp); break // TODO: Normalize weight
                        case 'unit': break
                        case 'url': doc.productInfo.unaffiliatedUrl = dp; break
                        case 'price': doc.lowestPriceRange.minPrice = dp; doc.lowestPriceRange.maxPrice = null; break
                        case 'worn': break // TODO: Maybe have special lighterpack stuff to make the quickstats still work?
                        case 'consumable': break
                    }
                }
                return [doc, qty]
            }
        }
        for (let i = 1; i < lines.length - 1; i++) {
            d = convertLine(lines[i])
            for (let i = 0; i < d[1]; i++) {
                importedGear.push(d[0])
            }
        }
        // Taken from addGear.js, imported above this script
        // BUG: TODO: HACK: Counts from bottom
        const tableRows = $('#add-gear-table > tbody > tr')
        let startLoadedIndex = tableRows.length
        const lastRowEmpty = isRowEmpty($(tableRows[startLoadedIndex - 1]))
        startLoadedIndex += lastRowEmpty ? -1 : 0
        for (let i = 0; i < importedGear.length; i++) {
            if (i > 0 || !lastRowEmpty) //TODO: Adjust startLoadedIndex if row not added
                addRow()
            const gearItem = importedGear[i]
            const lastRow = $('#add-gear-table > tbody > tr:last-child')
            lastRow.find(`#new-gear-name-${startLoadedIndex + i}`).val(gearItem.displayName)
            lastRow.find(`#new-gear-weight-${startLoadedIndex + i}`).val(gearItem.productInfo.weight)
            lastRow.find(`#new-gear-price-${startLoadedIndex + i}`).val(gearItem.lowestPriceRange.minPrice)
        }
    }
    reader.readAsText(e.target.files.item(0));
    e.target.value = null
})
$(".open-ag-modal").on('click', e => {
    $('.ag-modal').removeClass('hidden')
    $('.add-gear-container').addClass('add-gear-container-active')
})
$(".new-gear-button").on('click', () => {
    addRow()
})
$('#add-gear-cancel').on('click', () => {
    $('.ag-modal').addClass('hidden')
    $('.add-gear-container').removeClass('add-gear-container-active')
})
$('#add-gear-update').on('click', () => {
    let i = 0
    let targetElem = $(`#new-gear-table-row-${i}`)
    while (targetElem.length) {
        if ($(`#new-gear-remove-${i}`).is(':checked')) {
            if (i == 0) {
                targetElem.find('input,select').val('') // clear vals, keep template
                targetElem.find('input[type="checkbox"]').prop('checked', false)
            } else {
                targetElem.remove()
            }
        }
        targetElem = $(`#new-gear-table-row-${++i}`)
    }
})
const submitNewGear = e => {
    const addGearRows = $('#add-gear-table tbody tr')
    let newGear = []
    const shouldAddToPack = $(e.target).attr('data-atp') == undefined ? false : true

    $.each(addGearRows, (idx, elem) => {
        const $elem = $(elem)
        const gearSpec = {
            categoryId: $elem.find(`#new-gear-category-${idx}`).val(),
            displayName: $elem.find(`#new-gear-name-${idx}`).val(),
            brand: $elem.find(`#new-gear-brand-${idx}`).val(),
            weight: UOM_ConvertTo($elem.find(`#new-gear-weight-${idx}`).val(), $(`#container-weight-${idx} > select`).val(), 'g'),
            price: $elem.find(`#new-gear-price-${idx}`).val(),
            doesUserFavorite: $elem.find(`#new-gear-fav-${idx}`).is(':checked'),
            doesUserOwn: $elem.find(`#new-gear-owned-${idx}`).is(':checked'),
            shouldAddToPack: shouldAddToPack
        }
        newGear.push(gearSpec)
    })
    $.post('/pack/add/gear', {
        gearData: newGear
    }).done(response => {
        $.each(addGearRows, (idx, elem) => {
            let showError = false
            let someSuccess = false
            if (response.errorItems[idx]) {
                showError = true
                elem.classList.add('form-incorrect')
            } else {
                someSuccess = true
                const $e = $(elem)
                $e.removeClass('form-incorrect')
                if (idx == 0)
                    clearRow($e)
                else
                    $e.animate({opacity: 0}, () => {$e.remove()} )
            }
            if (showError)
                document.getElementById('add-gear-error').classList.remove('hidden')
            else {
                // Update price info
                const tPriceE = $('#total-price')
                let minPrice = parseFloat(tPriceE.attr('data-min'))
                let maxPrice = tPriceE.attr('data-max')
                maxPrice = maxPrice ? parseFloat(maxPrice) : undefined
                let cPrice = parseFloat(newGear[idx].price)
                tPriceE.attr('data-min', minPrice + cPrice)
                if (maxPrice) {
                    tPriceE.attr('data-max', maxPrice + cPrice)
                    tPriceE.text(`$${Math.floor((minPrice+cPrice)*100)/100}-$${Math.floor((maxPrice+cPrice)*100)/100}`)
                } else {
                    tPriceE.text(`${Math.floor((minPrice+cPrice)*100)/100}`)
                }
                // Update weight info
                const uom = document.getElementById('quick-stats-container').getAttribute('data-uom')
                const wornWeightE = $('#worn-weight')
                const wornBVal = parseFloat(wornWeightE.attr('data-base-weight'))
                wornWeightE.text(getDisplayWeight(wornBVal, 'g', uom))
                const baseWeightE = $('#base-weight')
                const baseBVal = parseFloat(baseWeightE.attr('data-base-weight'))
                baseWeightE.text(getDisplayWeight(baseBVal, 'g', uom))

                const totalWeightE = $('#total-weight')
                const totalBVal = parseFloat(totalWeightE.attr('data-base-weight'))
                totalWeightE.text(getDisplayWeight(totalBVal, 'g', uom))

                document.getElementById('add-gear-error').classList.add('hidden')
            }
            // Update packstats
           
            // Refresh build
            if (shouldAddToPack && someSuccess) {
                // Changes made to pack
                $.get('/api/pack/render').done(d => {
                    $('.pack-complete-data').html(d)
                    const qsData = $('#build-quickstats-data')
                    $('#total-price').text(qsData.attr('data-displayPrice'))
                    const ww = $('#worn-weight')
                    ww.text(qsData.attr('data-displayWorn'))
                    ww.attr('data-base', qsData.attr('data-base-worn'))
                    const bw = $('#base-weight')
                    bw.text(qsData.attr('data-displayBase'))
                    bw.attr('data-base', qsData.attr('data-base-base'))
                    const tw = $('#total-weight')
                    tw.text(qsData.attr('data-displayTotal'))
                    tw.attr('data-base', qsData.attr('data-base-total'))

                    $(".open-ag-modal").on('click', e => {
                        $('.ag-modal').removeClass('hidden')
                        $('.add-gear-container').addClass('add-gear-container-active')
                    })
                })
            }
        })
    })
}
$('#add-gear-submit').on('click', submitNewGear)
$('#add-gear-submit-mobile').on('click', submitNewGear)

const updateWithValue = (e) => {
    const $e = $(e.target)
    const targetId = $e.attr('data-bid')
    if (e.target.type === 'checkbox')
        setSelectedValue(targetId, $e.is(':checked'), true)
    else if (e.target.nodeName !== "SELECT") {
        setSelectedValue(targetId, e.target.value + (e.key == undefined ? '' : e.key))
    } else
        setSelectedValue(targetId, e.target.value)
}
$('.bulk-edit-valchange').on('keypress', updateWithValue).on('change', updateWithValue)

const setWeightData = (targetInput, targetSelect, newUOM) => {
    const pUOM = targetSelect.attr('data-prevUOM')
    const pVal = targetInput.val()
    targetSelect.attr('data-prevUOM', newUOM)
    const newVal = UOM_ConvertTo(pVal, pUOM, newUOM)
    console.log(newVal, pVal, pUOM, newUOM)
    if (isNaN(newVal))
        return
    targetInput.val(newVal)
}

$('.add-gear-uom').on('change', onUOMSelectChange)