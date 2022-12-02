class streamManager{
    #url
    #video
    #itemTitle
    #itemSubTitle
    resumed = false
    init
    hasNext = false

    constructor(){
        this.#url = `/stream?type=${history.state.item.type}&id=${history.state.item.id}&episode=${history.state.item.episodeID}&user=${localStorage.getItem('userID')}`
        this.#video = document.getElementById('stream')
    }
    async setTitle(){
        this.#itemTitle = await media.getTitle(history.state.item.type, history.state.item.id)
        if(history.state.item.type == 'show'){
            const eData = await media.getEpisode(history.state.item.id, history.state.item.episodeID)
            console.log(eData)
            this.#itemSubTitle = `S${eData.season}:E${eData.episode} - ${eData.title}`
        }
        document.title = `Streaming ${this.#itemTitle} | Betflix`
    }
    start(){
        return new Promise(async(resolve)=>{
            this.init = await user.getProgress(history.state.item.type, history.state.item.id, history.state.item.episodeID)
            this.init = this.init.percent
            $('#videoPlayer video').attr('src', this.#url)
            if(history.state.item.type == 'show'){
                const next = await media.nextEpisode(history.state.item.id, history.state.item.episodeID)
                if('id' in next) this.hasNext = true; $('#videoPlayer #controls #middleSection #nextEpisode').css('background-image', `url('${next.still}')`)
            }
            this.setTitle()
            resolve()
        })
    }
    toggle(){
        if(this.#video.paused) this.#video.play()
        else this.#video.pause()
    }
    seek(percent){
        const seek = (this.#video.duration / 100) * percent
        this.#video.currentTime = seek
    }
    mute_toggle(){}
    volume(val){
        this.#video.volume = val
    }
    async updateContinue(){
        while(true){
            const time = this.#video.currentTime 
            if(this.#video.duration - time <= 60){
                if(history.state.item.type == 'show'){
                    if(this.hasNext){
                        $('#videoPlayer #controls #middleSection #nextEpisode').css('display', 'flex')
                        $('#videoPlayer #controls #middleSection').animate({opacity:'1'}, 500)
                    }
                    const success = await user.setNext(history.state.item.id, history.state.item.episodeID)
                    if(!success) continue
                }
                const success = await user.deleteContinue(history.state.item.type, history.state.item.id, history.state.item.episodeID)
                if(!success) continue
                await user.addComplete(history.state.item.type, history.state.item.id, history.state.item.episodeID)
            }
            else if(time != null){
                $('#videoPlayer #controls #middleSection #nextEpisode').css('display', 'none')
                $('#videoPlayer #controls #middleSection').css('opacity', '0')
                
                await user.updateContinue(history.state.item.type, history.state.item.id, history.state.item.episodeID, (100 / this.#video.duration) * this.#video.currentTime)
            }
            await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 1000)})
        }
    }
    async setData(){
        while(true){
            
            if(!this.resumed && this.#video.currentTime > 0){
                this.#video.currentTime = (this.#video.duration / 100) * this.init    
                this.resumed = true
            }

            const range = (100 / this.#video.duration) * this.#video.currentTime
            $('#videoPlayer #controls #bottomSection #progressBarFrame #knobPosition').css('margin-left', `-${100-range}%`)
            $('#videoPlayer #controls #bottomSection #progressBar #fill').css('width', `${range}%`)
            $('#videoPlayer #controls #topSection #title #text #mainTitle').text(this.#itemTitle)
            $('#videoPlayer #controls #topSection #title #text #subTitle').text(this.#itemSubTitle)

            if(document.fullscreen) $('#videoPlayer #controls #bottomSection #streamFullScreen').css('background-image', 'url(../img/icons/exitFullscreen.png)')
            else $('#videoPlayer #controls #bottomSection #streamFullScreen').css('background-image', 'url(../img/icons/fullscreen.png)')

            // SET TIME
            const curHour = Math.trunc(this.#video.currentTime / 3600)
            let curMin  = Math.trunc((this.#video.currentTime - (curHour * 3600)) / 60)
            if(curMin < 10) curMin = '0'+curMin
            let curSec  = Math.trunc(this.#video.currentTime - (curHour * 3600) - (curMin * 60))
            if(curSec < 10) curSec = '0'+curSec
            let curTime
            if(curHour > 0) curTime = `${curHour}:${curMin}:${curSec}`
            else curTime = `${curMin}:${curSec}`

            const totHour = Math.trunc(this.#video.duration / 3600)
            let totMin  = Math.trunc((this.#video.duration - (totHour * 3600)) / 60)
            if(totMin < 10) totMin = '0'+totMin
            let totSec  = Math.trunc(this.#video.duration - (totHour * 3600) - (totMin * 60))
            if(totSec < 10) totSec = '0'+totSec
            let totTime

            if(totHour > 0) totTime = `${totHour}:${totMin}:${totSec}`
            else totTime = `${totMin}:${totSec}`

            if(this.#video.duration > 0) $('#videoPlayer #controls #bottomSection #time').text(`${curTime} / ${totTime}`)

            if(this.#video.paused) $('#videoPlayer #streamToggle').css('background-image', 'url(./img/icons/play.png)')
            else $('#videoPlayer #streamToggle').css('background-image', 'url(./img/icons/pause.png)')

            await new Promise((r)=>{setTimeout(()=>{r()}, 50)})
        }
    }
    getDuration(){
        return this.#video.duration
    }
}

let stream
if(history.state.page == 'videoPlayer') stream = new streamManager()

// PROGRESS FUNCTIONALITY
let mouseDown = false
let onProgress = false
let onVolumeSlider = false
let volumeHover
let timeSet = false
let volumeSet = false
let mouseX 
let controlsHover = false
let controlsTimeout = setTimeout(function() {
    if(!mouseDown){
        $('#videoPlayer #controls #topSection, #videoPlayer #controls #bottomSection').fadeOut()
        $('#videoPlayer').css('cursor', 'none')
    }
}, 3000);

document.getElementById('videoPlayer').onmousedown = ()=>{mouseDown = true}
document.getElementById('videoPlayer').onmouseup   = (e)=>{
    if(onProgress && !timeSet) stream.seek(mouseX)  
    if(onVolumeSlider && !volumeSet){
        const pos = e.clientY
        const offset = $('#main #videoPlayer #controls #volumeSlider').offset().top
        const length  = $('#main #videoPlayer #controls #volumeSlider').height()

        const raw_range = 100 - (((Math.min( Math.max(0, pos-offset), length )) / length) * 100)
        const range = Math.trunc(raw_range) / 100
        console.log('volume', range)
        $('#main #videoPlayer #controls #volumeSlider #fill').css('height', `${raw_range}%`)
        stream.volume(range)
    } 
    mouseDown = false; onProgress = false; timeSet = true; onVolumeSlider = false
}

document.getElementById('progressBarFrame').onmousedown = ()=>{onProgress = true}
document.getElementById('volumeSlider'    ).onmousedown = ()=>{onVolumeSlider = true}

$('#videoPlayer #controls .button, #videoPlayer #controls #progressBarFrame, #videoPlayer #controls #title').mouseover(()=>{controlsHover = true}).mouseleave(()=>{controlsHover = false})

document.getElementById('videoPlayer').onmousemove = function(e){
    timeSet = false
    volumeSet = false

    if(!mouseDown && !volumeHover && $('#videoPlayer #volumeSlider').css('opacity') > 0) $('#videoPlayer #volumeSlider').stop(true, false).animate({opacity:'0'})
    mouseX = Math.min( ( 100 / $('#main #videoPlayer #controls #bottomSection #progressBar').width() ) * Math.max( e.clientX - $('#main #videoPlayer #controls #bottomSection #progressBar').offset().left, 0 ) , 100 )
    if(onProgress){
        stream.seek(mouseX)
        timeSet = true
    }

    if(onVolumeSlider){
        const pos = e.clientY
        const offset = $('#main #videoPlayer #controls #volumeSlider').offset().top
        const length  = $('#main #videoPlayer #controls #volumeSlider').height()

        const raw_range = 100 - (((Math.min( Math.max(0, pos-offset), length )) / length) * 100)
        const range = Math.trunc(raw_range) / 100
        console.log('volume', range)
        $('#main #videoPlayer #controls #volumeSlider #fill').css('height', `${raw_range}%`)
        stream.volume(range)
        volumeSet = true
    }

    $('#videoPlayer').css('cursor', 'default')
    clearTimeout(controlsTimeout);
    $('#videoPlayer #controls #topSection, #videoPlayer #controls #bottomSection').fadeIn();
    controlsTimeout = setTimeout(function() {
        if(!controlsHover && !mouseDown){
            $('#videoPlayer #controls #topSection, #videoPlayer #controls #bottomSection').fadeOut();
            $('#videoPlayer').css('cursor', 'none')
        }
    }, 3000);

}


// NEXT EPISODE
$('#videoPlayer #controls #middleSection #nextEpisode').click(async ()=>{
    const next = await media.nextEpisode(history.state.item.id, history.state.item.episodeID)

    history.replaceState({page:'videoPlayer', item:{id:history.state.item.id, type:'show', episodeID:next.id}}, '', '#VIDEOPLAYER')
    location.reload()
})

// PROGRESSBAR HOVER
$('#videoPlayer #controls #bottomSection #progressBarFrame').mouseover(function(){
    $(this).find('#progressBar').stop(true, false).animate({
        height: '12px'
    }, 200)

    $('#videoPlayer #progressBarFrame #knob').stop(true, false).animate({
        width: KNOB_SIZE,
        height: KNOB_SIZE
    }, 200)

}).mouseleave(function(){
    $(this).find('#progressBar').stop(true, false).animate({
        height: '4px'
    }, 200)

    $('#videoPlayer #progressBarFrame #knob').stop(true, false).animate({
        width: SMALL_KNOB_SIZE,
        height: SMALL_KNOB_SIZE
    }, 200)
})

// VOLUME HOVER
$('#videoPlayer #volume_frame').mouseover(function(){volumeHover = true; $('#videoPlayer #volumeSlider').stop(true, false).animate({opacity:'1'})}).mouseleave(function(){volumeHover = false; if(!mouseDown)$('#videoPlayer #volumeSlider').stop(true, false).animate({opacity:'0'})})

//KEYPRESS
$( "#browse #videoPlayer" ).keypress(function(e) {
    console.log( e )
});