let numSelected = 0
$('.bulk-edit-check').on('change', (e) => {
    if (e.target.checked)
        numSelected++
    else
        numSelected--
    if (numSelected > 0)
        $('#bulk-edit-form').removeClass('hidden')
    else
        $('#bulk-edit-form').addClass('hidden')
})
$("#bulk-edit-form-action").on('submit', e => {
    e.preventDefault()
    if (document.getElementById('bulk-delete').checked) {
        document.getElementById('bulk-edit-confirmation').classList.remove('hidden')
    } else {
        e.target.classList.add('hidden')
    }
})
$('#do-not-delete').on('click', e => {
    document.getElementById('bulk-edit-form').classList.add('hidden')
})
$('#delete-button').on('click', e => {
    let idList = []
    for (const el of document.getElementsByClassName('bulk-edit-check')) {
        if (el.checked) {
            idList.push(el.getAttribute('data-uid'))
        }
    }
    let urlParams = new URLSearchParams()
    urlParams.set('usrs', idList.join(','))
    if (document.getElementById('bulk-delete').checked) {
        $.ajax({
            url: '/admin/users?' + urlParams.toString(),
            type: 'DELETE'
        }).done(() => window.location.reload())
    }
    window.location.reload()
})
const tag = window.location.hash
$('.admin-tab').addClass('hidden')
document.getElementById(tag.slice(1)).classList.remove('hidden')
$(window).on('hashchange', e => {
    const tag = window.location.hash
    $('.admin-tab').addClass('hidden')
    document.getElementById(tag.slice(1)).classList.remove('hidden')
})
$('#data .tab-header button').on('click', e => {
    const id = e.target.getAttribute('data-a-id')
    $('#data .data-tab').addClass('hidden')
    document.getElementById(id).classList.remove('hidden')
})
$('.delete-message').on('click', e => {
    const mid = e.target.getAttribute('data-id')
    $.ajax({
        url: '/api/messages/delete/' + mid,
        type: 'DELETE'
    }).done(()=>window.location.reload())
})
let labels = []
let userData = {datasets:[{label: 'Total Users', borderColor:'#d24814', fill: true, data:[]}]}
let packData = {datasets:[{label: 'Total Packs', borderColor:'#d24814', fill: true, data:[]}]}
let gearData = {datasets:[{label: 'Total Gear', borderColor:'#d24814', fill: true, data:[]}]}
let sessionData = {datasets:[{label: 'Total Sessions', borderColor:'#d24814', fill: true, data:[]}]}
const analData = JSON.parse(document.getElementById('analytics-history').getAttribute('data-analytics-history'))
let i = 0
let maxGear = 0
let maxPack = 0
let maxUser = 0
let maxSessions = 0
for (const dItem of analData) {
    labels.push(++i)
    let u = dItem.numUsers
    if (u > maxUser)
        maxUser = u
    userData.datasets[0].data.push(u)
    let p = dItem.numPacks
    if (p > maxPack)
        maxPack = p
    packData.datasets[0].data.push(p)
    let g = dItem.numGearItems
    if (g > maxGear)
        maxGear = g
    gearData.datasets[0].data.push(g)
    let s = dItem.numSessions
    if (s > maxSessions)
        maxSessions = s
    sessionData.datasets[0].data.push(s)
}
userData.labels = labels
gearData.labels = labels
packData.labels = labels
sessionData.labels = labels
new Chart(document.getElementById('user-chart'), {
    type: 'line',
    data: userData,
    options: {scales:{yAxes:[{ticks:{beginAtZero:true, suggestedMax: maxUser*1.5}}]}}
})
new Chart(document.getElementById('gear-chart'), {
    type: 'line',
    data: gearData,
    options: {scales:{yAxes:[{ticks:{beginAtZero:true, suggestedMax: maxGear*1.5}}]}}
})
new Chart(document.getElementById('pack-chart'), {
    type: 'line',
    data: packData,
    options: {scales:{yAxes:[{ticks:{beginAtZero:true, suggestedMax: maxPack*1.5}}]}}
})
new Chart(document.getElementById('sessions-chart'), {
    type: 'line',
    data: sessionData,
    options: {scales:{yAxes:[{ticks:{beginAtZero:true, suggestedMax: maxSessions*1.5}}]}}
})