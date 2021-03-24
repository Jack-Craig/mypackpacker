$('.report-button').on('click', e => {
    const rID = e.target.getAttribute('data-rel-id')
    const rType = e.target.getAttribute('data-rep-type')
    document.getElementById('report-modal').classList.remove('hidden')
    const submitButton = document.getElementById('submit-report')
    submitButton.setAttribute('data-rel-id', rID)
    submitButton.setAttribute('data-rep-type', rType)
})

$('#cancel-report').on('click', e => {
    document.getElementById('report-modal').classList.add('hidden')
})

$('#submit-report').on('click', e => {
    const rID = e.target.getAttribute('data-rel-id')
    const rType = e.target.getAttribute('data-rep-type')
    const rReason = document.getElementById('report-select').value
    $.post('/api/messages/create', {
        message: JSON.stringify({
            reportedId: rID,
            reportedType: rType,
            reportedReason: rReason
        }),
        isAdminMessage: true,
        isWorkerMessage: false,
        targets: [],
        type: 'report',
    }).done(()=>{
        document.getElementById('report-modal-text').innerHTML = '<h2>Thank you for your report! We will look into it.</h2>'
        document.getElementById('submit-report').classList.add('hidden')
    })
})

