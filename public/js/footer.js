$('#report-bug').on('click', e => {
    document.getElementById('report-bug-modal').classList.remove('hidden')
})
$('#cancel-bug-report').on('click', e => {
    document.getElementById('report-bug-modal').classList.add('hidden')
})
$('#report-bug-form').on('submit', e => {
    e.preventDefault()
    console.log('Submit!')
    $.post('/api/messages/create', {
        type: 'bugreport',
        isAdminMessage: true,
        isWorkerMessage: false,
        targets: [],
        message: document.getElementById('bug-report-textarea').value,
    }).done(()=>{
        document.getElementById('bug-report-text').innerHTML = "<h2>Thank you for your feedback!</h2>"
        document.getElementById('submit-bug-report').classList.add('hidden')
        document.getElementById('cancel-bug-report').value = "done"
    })
})