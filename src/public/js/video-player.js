const video = document.getElementById('video-player');
const timer = document.getElementById('timer');
const seekBar = document.getElementById('seek-bar');
const fill = document.getElementById('fill');
const handle = document.getElementById('handle');
const controls = document.getElementById('controls');
const playButtonImg = document.getElementById('playButtonImg');
const screenButtonImg = document.getElementById('screenButtonImg');

console.log(video.getAttribute('data-resume'));

function startDrag(){
    document.addEventListener('mousemove', dragSeek);
}

function endDrag(){
    document.removeEventListener('mousemove', dragSeek);
}

function seek(e){
    const percent = e.offsetX / this.offsetWidth;
    video.currentTime = percent * video.duration;
}

function dragSeek(e){
    const percent = Math.max(Math.min((e.clientX - seekBar.offsetLeft) / seekBar.offsetWidth, 1), 0);
    console.log(percent);
    updateSeekBar(percent);
    video.currentTime = percent * video.duration;
}

function updateSeekBar(e, percent){
    if(percent == undefined){
        percent = video.currentTime / video.duration;
    }
    fill.style.width = `${percent * 100}%`;
    handle.style.left = `${percent * 100}%`;
    timer.innerHTML = `${formatTime(video.currentTime)}/${formatTime(video.duration)}`;
}

function togglePlay(){
    if(video.paused){
        video.play();
    }
    else{
        video.pause();
    }
    buttonUI();
}

function formatTime(seconds){
    const hours = Math.trunc(seconds / 3600);
    seconds -= hours * 3600;
    const minutes = Math.trunc(seconds / 60);
    seconds -= minutes * 60;
    seconds = Math.trunc(seconds);
    
    return hours > 0 ? `${hours}:${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`  : `${('0' + minutes).slice(-2)}:${('0' + seconds).slice(-2)}`;
}

const controlsVisibility = {
    timer: setTimeout(async () => {
        $('#controls, header').fadeOut(300);
        $('body').css('cursor', 'none');
    }, 3000),
    hide: function() {
        this.timer = setTimeout(async () => {
            $('#controls, header').fadeOut(300);
            $('body').css('cursor', 'none');
        }, 4000)
    },
    show: async function() {
        clearTimeout(this.timer);
        $('#controls, header').fadeIn(300);
        $('body').css('cursor', 'default');
        this.hide();
    },
}

function buttonUI(){
    if(video.paused){
        playButtonImg.src = '/img/icons/play.png';
    }
    else{
        playButtonImg.src = '/img/icons/pause.png';
    }

    if(!document.fullscreenElement){
        screenButtonImg.src = '/img/icons/fullscreen.png';
    }
    else{
        screenButtonImg.src = '/img/icons/exitFullscreen.png';
    }
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        })
        screenButtonImg.src = '/img/icons/exitFullscreen.png';
    } 
    else {
        document.exitFullscreen();
        screenButtonImg.src = '/img/icons/fullscreen.png';
    }
}

seekBar.addEventListener('click', seek);
video.addEventListener('click', togglePlay);
document.addEventListener('mouseup', endDrag);
seekBar.addEventListener('mousedown', startDrag);
video.addEventListener('timeupdate', updateSeekBar);
video.addEventListener('timeupdate', buttonUI);
document.addEventListener('mousemove', controlsVisibility.show.bind(controlsVisibility));