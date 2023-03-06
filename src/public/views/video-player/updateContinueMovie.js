(async function updateContiue(){
    const percent = Math.trunc((100 / (video.getAttribute('data-duration')) * video.currentTime) * 100) / 100
    const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            percent,
            movieId: video.getAttribute('data-id')
        })
    }
    
    if(!video.paused){
        await fetch('/user/update/continue/movie', fetchOptions)
    }
    
    await new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, 4000)
    })

    updateContiue()
})()