{
    const animDelay = 8000
    const animDur = 400
    const runFrame = () => {
        const parentElem = $('.landing-image-wrapper')
        const windowElem = $('.slideshow-container')
        const pp = parentElem.offset()
        const curSlide = $('.animate-copy')
        let newSlide = curSlide.next()
        if (!newSlide.length) {
            newSlide = $('.slideshow-container').children().first()
        }
        console.log(windowElem.offset())
        console.log(windowElem.css('height'))
        
        curSlide.animate({
            top: windowElem.css('height')
        }, animDur,()=> {
            curSlide.css('top', '-'+curSlide.css('height'))
            curSlide.addClass('hidden')
        })
                
        newSlide.removeClass('hidden').animate({
            top: '0%',
        }, animDur)

        curSlide.removeClass('animate-copy')
        newSlide.addClass("animate-copy")
      
    }
    setInterval(runFrame, animDelay)
    runFrame()
}