$('.double-slider').each((idx, elem) => {
    // TODO: Validate that elem has necessary attributes
    const start = Math.floor(parseFloat(elem.getAttribute('min')))
    const end = Math.ceil(parseFloat(elem.getAttribute('max')))
    if (start == end || (isNaN(start) && isNaN(end))) {
        $(elem).removeClass('double-slider').parent().addClass('hidden')
        return
    }
    let prefix = elem.getAttribute('prefix')
    let suffix = elem.getAttribute('suffix')
    let step = elem.getAttribute('step')
    // Check url to see if some filters have already been applied that would change the values of this slider
    // i.e. this is a price range slider and the filter has just been applied and the page has been refreshed
    const vsKey = elem.getAttribute('val-store-key')
    let startVal = start
    let endVal = end
    if (vsKey) {
        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has(vsKey)) {
            const rangeArr = urlParams.get(vsKey).split(',')
            if (elem.hasAttribute('data-uom')) {
                const uom = elem.getAttribute('data-uom')
                startVal = UOM_ConvertTo(parseFloat(rangeArr[0]), 'g', uom)
                endVal = UOM_ConvertTo(parseFloat(rangeArr[1]), 'g', uom)
            } else {
                startVal = rangeArr[0]
                endVal = rangeArr[1]
            }
        }
    }
    prefix = prefix ? prefix : ''
    suffix = suffix ? suffix : ''
    const format = {
        from: v => {
            return Number(v.replace(prefix, '').replace(suffix, ''))
        },
        to: v => {
            return `${prefix}${Math.floor(v * 100) / 100}${suffix}`
        }
    }

    noUiSlider.create(elem, {
        range: {
            min: start,
            max: end
        },
        start: [startVal, endVal],
        margin: 0,
        connect: true,
        tooltips: true,
        format: format,
        step: step ? parseFloat(step) : .01
    })
    elem.noUiSlider.on('update', (values, handle, unencoded) => {
        elem.setAttribute('unenc-min', unencoded[0])
        elem.setAttribute('unenc-max', unencoded[1])
    })
    mergeTooltips(elem, 15, '-')
})
/**
 * @param slider HtmlElement with an initialized slider
 * @param threshold Minimum proximity (in percentages) to merge tooltips
 * @param separator String joining tooltips
 */
function mergeTooltips(slider, threshold, separator) {

    var textIsRtl = getComputedStyle(slider).direction === 'rtl';
    var isRtl = slider.noUiSlider.options.direction === 'rtl';
    var isVertical = slider.noUiSlider.options.orientation === 'vertical';
    var tooltips = slider.noUiSlider.getTooltips();
    var origins = slider.noUiSlider.getOrigins();

    // Move tooltips into the origin element. The default stylesheet handles this.
    tooltips.forEach(function (tooltip, index) {
        if (tooltip) {
            origins[index].appendChild(tooltip);
        }
    });

    slider.noUiSlider.on('update', function (values, handle, unencoded, tap, positions) {

        var pools = [[]];
        var poolPositions = [[]];
        var poolValues = [[]];
        var atPool = 0;

        // Assign the first tooltip to the first pool, if the tooltip is configured
        if (tooltips[0]) {
            pools[0][0] = 0;
            poolPositions[0][0] = positions[0];
            poolValues[0][0] = values[0];
        }

        for (var i = 1; i < positions.length; i++) {
            if (!tooltips[i] || (positions[i] - positions[i - 1]) > threshold) {
                atPool++;
                pools[atPool] = [];
                poolValues[atPool] = [];
                poolPositions[atPool] = [];
            }

            if (tooltips[i]) {
                pools[atPool].push(i);
                poolValues[atPool].push(values[i]);
                poolPositions[atPool].push(positions[i]);
            }
        }

        pools.forEach(function (pool, poolIndex) {
            var handlesInPool = pool.length;

            for (var j = 0; j < handlesInPool; j++) {
                var handleNumber = pool[j];

                if (j === handlesInPool - 1) {
                    var offset = 0;

                    poolPositions[poolIndex].forEach(function (value) {
                        offset += 1000 - 10 * value;
                    });

                    var direction = isVertical ? 'bottom' : 'right';
                    var last = isRtl ? 0 : handlesInPool - 1;
                    var lastOffset = 1000 - 10 * poolPositions[poolIndex][last];
                    offset = (textIsRtl && !isVertical ? 100 : 0) + (offset / handlesInPool) - lastOffset;

                    // Center this tooltip over the affected handles
                    tooltips[handleNumber].innerHTML = poolValues[poolIndex].join(separator);
                    tooltips[handleNumber].style.display = 'block';
                    tooltips[handleNumber].style[direction] = offset + '%';
                } else {
                    // Hide this tooltip
                    tooltips[handleNumber].style.display = 'none';
                }
            }
        });
    });
}