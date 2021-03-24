$('.sidebar').prepend($('.hamburger-menu-exit-container').clone().removeClass('hidden').attr('id', "hamburger-exit-container"))
const initHeight = $('.sidebar').css('height')
$('main').css('min-height', initHeight)
$('#hamburger-stack').on('click', e => {
    $('main').css('min-height', $('.sidebar').css('height'))
    const sidebar = $('.sidebar')
    sidebar.css('display', 'block')
    sidebar.animate({ left: '0px' })
})
$('#hamburger-exit-container').on('click', e => {
    $('main').css('min-height', initHeight)
    const sidebar = $('.sidebar')
    sidebar.animate({ left: '-' + sidebar.css('width') }, {}, () => sidebar.css('display', 'none'))
})