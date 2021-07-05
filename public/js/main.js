{
    const animDelay = 7000
    const animDur = 400
    $('.slideshow-panel:not(.animate-copy)').css('top', '-'+$('.animate-copy').css('height'))
    const runFrame = () => {
        const windowElem = $('.slideshow-container')
        const curSlide = $('.animate-copy')
        
        let newSlide = curSlide.next()
        if (!newSlide.length) {
            newSlide = $('.slideshow-container').children().first()
        }
        
        curSlide.animate({
            top: windowElem.css('height')
        }, animDur,()=> {
            curSlide.css('top', '-'+curSlide.css('height'))
            curSlide.addClass('ip-loading')
        })
                
        newSlide.removeClass('ip-loading').animate({
            top: '0%',
        }, animDur)

        curSlide.removeClass('animate-copy')
        newSlide.addClass("animate-copy")
      
    }
    //setInterval(runFrame, animDelay)
}