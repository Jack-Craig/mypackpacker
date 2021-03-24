$('#atp-button').on('click', e => {
    $.get(`/pack/add/${e.target.getAttribute('data-id')}`).done(()=>{
        window.location = '/pack'
    })
})