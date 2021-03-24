$(window).on('load', () => {
    $('#description').on('input', (event) => {
        const labelElem = $('#description-label')
        const inputElem = $(event.target)
        const val = inputElem.val()
        if (val.length > 1200) {
            inputElem.val(val.substring(0, 481))
        } else {
            labelElem.text(`Description (${1200 - val.length})`)
        }
    })
    const descriptionTextArea = $('#description')
    descriptionTextArea.attr('style', `resize:none;height:auto;height:${descriptionTextArea.prop('scrollHeight')}px;overflow-y:hidden;`).on('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = (this.scrollHeight) + 'px'
    })
    autosize(descriptionTextArea)
    
    $('#title').on('input', (event) => {
        const labelElem = $('#title-label')
        const inputElem = $(event.target)
        const val = inputElem.val()
        if (val.length > 24) {
            inputElem.val(val.substring(0, 25))
        } else {
            labelElem.text(`Title (${24 - val.length})`)
        }
    })
    const initCropper = (objectUrl) => {
        let preview = $('#image-upload-preview')
        preview.cropper('destroy')
        if (objectUrl) {
            preview.attr('src', objectUrl)
            preview.on('load', ()=>URL.revokeObjectURL(objectUrl))
        }
        preview.cropper({
            aspectRatio: 1,
            viewMode: 2,
            ready: event => $("#pack-image-preview-cropped").attr('src', $('#image-upload-preview').cropper('getCroppedCanvas').toDataURL('image/png')),
            cropend: event => $("#pack-image-preview-cropped").attr('src', $('#image-upload-preview').cropper('getCroppedCanvas').toDataURL('image/png'))
        })
        $('.crop-image-pair').removeClass('hidden')
        $('#save-image').removeClass('hidden')
        $('#edit-image').addClass('hidden')
        $('#final-pack-image').addClass('hidden')
    }
    $(window).on('lazy-image-loaded', (e, callerElement) => {
        if (callerElement === $('#image-upload-preview')[0]) {
            initCropper(false)
            $('#image-upload').prop('required', false)
        }
    })
    $('#image-upload').on('change', (e) => {
        initCropper(URL.createObjectURL(e.target.files[0]))
        
    })
    $('#save-image').on('click', () => {
        let finalPreview = $('#final-pack-image')
        finalPreview.attr('src', $('#image-upload-preview').cropper('getCroppedCanvas').toDataURL('image/png'))
        finalPreview.removeClass('hidden')
        $('#edit-image').removeClass('hidden')
        $('.crop-image-pair').addClass('hidden')
        $('#save-image').addClass('hidden')
    })
    $('#edit-image').on('click', e => {
        $('.crop-image-pair').removeClass('hidden')
        $('#save-image').removeClass('hidden')
        $('#final-pack-image').addClass('hidden')
        $(e.target).addClass('hidden')
    })
    $('#publish-form').on('submit', e => {
        e.preventDefault()
        let formData = new FormData(e.target)
        $('#image-upload-preview').cropper('getCroppedCanvas').toBlob(blob => {
            formData.append('-preview.png', blob)
            $.ajax('/user/packs/publish', {
                method: 'POST',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                cache: false,
            }).done(d => window.location='/completed')
        }) 
    })
})
