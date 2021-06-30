$('.jq-override-form').on('submit', event => {
    event.preventDefault()
    const elem = $(event.currentTarget)
    $.ajax({
        url: elem.attr('action'),
        type: 'POST',
        data: elem.serialize(),
        success: data => {
            $('.red-hl').removeClass('red-hl')
            $('.error-msg').addClass('hidden')
            if (data.error) {
                const target = $('#' + data.errorMessage)
                target.removeClass('hidden')
                $('.' + target.attr('data-linked-input')).addClass('red-hl')
            } else {
                const pathAndParams = window.location.toString().split('?')
                console.log(pathAndParams)
                window.location = pathAndParams[0] + '?success=true'
            }
        }
    })
    return false
})