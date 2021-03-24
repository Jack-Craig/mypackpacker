$('#open-idea-modal').on('click', e => {
    document.getElementById('submit-idea-modal').classList.remove('hidden')
})
$('#cancel-feedback').on('click', e => {
    document.getElementById('submit-idea-modal').classList.add('hidden')
})
$('#feedback-form').on('submit', e => {
    e.preventDefault()
    $.post('/api/messages/create', {
        type: 'feedback',
        isAdminMessage: true,
        isWorkerMessage: false,
        targets: [],
        message: document.getElementById('message-content').value,
    }).done(()=>{
        document.getElementById('feedback-form-text').innerHTML = "<h2>Thank you for your feedback!</h2>"
        document.getElementById('submit-feedback').classList.add('hidden')
        document.getElementById('cancel-feedback').value = "done"
    })
})