class itemPageManager{
    async setData(type, id){
        let duration
        const data = await media.search(type, id)

        if(type == 'movie'){
            let hours, minutes
            hours = Math.trunc(data.duration/3600)
            minutes = Math.trunc((data.duration - (hours * 3600)) / 60)
            if(hours > 0) duration = `${hours}hr ${minutes}m`
            else duration = `${minutes}m`

            $('#item #info #data #year').text(data.year)

            const directors = await media.getMovieDirector(id)
            for(let i = 0; i < directors.length; i++){
                let insertHTML = `
                    <div class="insert">
                        <div class="metadata">${JSON.stringify({type:'director',id: directors[i].id})}</div>
                        <div class="profile" style="background-image:url(${directors[i].profile})"></div>
                        <div class="info">
                            <div class="actor">${directors[i].name}</div>
                            <div class="character">Director</div>
                        </div>
                    </div>
                `
                $('#item #info #director').append(insertHTML)
            }
            $('#item #info #seasonBar, #item #info #seasonScroll').hide()

        }
        else if(type == 'show'){
            const season = data.num_seasons > 1 ? `${data.num_seasons} seasons` : `1 season`
            const episode = data.num_episodes > 1 ? `${data.num_episodes} episodes` : `1 episode`
            duration = `${season}, ${episode}`

            const year = (String(data.start_date).slice(0,4) == String(data.end_date).slice(0,4)) ? String(data.start_date).slice(0,4) : `${String(data.start_date).slice(0,4)} - ${String(data.end_date).slice(0,4)}`
            $('#item #info #data #year').text(year)

            $('#item #info #tabBar #directorTab').hide()
            const current = await user.currentEpisode(data.id)
            this.setSeason(current.season)

            const seasonList = await media.seasonList(data.id)
            for(let i = 0; i < seasonList.length; i++){
                const html = `
                    <div class="season" onclick="itemManager.setSeason(${seasonList[i]})"> Season ${seasonList[i]} </div>
                `
                $('#item #info #dropDown').append(html)
            }

        }
        
        data.genres = data.genres.replace(/[,]/g, ', ').replace(/[_]/g, '-')  
        
        document.title = `Watch ${data.title} | Stream on Betflix`

        $("#item #backdrop #main img").attr("src", data.backdrop);
        $('#item #info #logo').css('background-image', `url('${data.logo}')`)
        $('#item #info #title').text(data.title)
        $('#item #info #genres').text(data.genres)
        $('#item #info #data #duration').text(duration)
        $('#item #info #data #rating').text(data.content_rating)
        if(data.vote > 0) $('#item #info #data #vote').text(`${Math.trunc(data.vote * 10)}%`)
        else $('#item #info #data #vote').hide()
        if(data.overview.length > 250) $('#item #info #overview').html(data.overview.slice(0, 245).split(' ').slice(0, -1).join(' ') + `...`)
        else $('#item #info #overview').text(data.overview)

        const budget = data.budget > 0 ? '$' + data.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'unknown'
        const revenue = data.revenue > 0 ? '$' + data.revenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'unknown'
        $('#info #details #budget').text(budget)
        $('#info #details #revenue').text(revenue)

        $('#info #details #studio').text(data.studio)

        const rat = await media.getRatingDescription(data.type, data.content_rating)
        $('#info #details #rating').html(`${rat.title} | ${rat.description}`)
        
        $('#item #remWatchlistButton').hide()
        if(await user.isInWatchlist(history.state.item.type, history.state.item.id)){
            $('#item #remWatchlistButton').show()
            $('#item #addWatchlistButton').hide()
        }

        $('#item #info #seasonBar #dropDown').hide()

        const cast = await media.getCast(id, data.type)
        $('#item #info #cast').html('')
        for(let i = 0; i < cast.length; i++){
            let insertHTML = `
                <div class="insert">
                    <div class="metadata">${JSON.stringify({type:'actor', id:cast[i].actor.id})}</div>
                    <div class="profile" style="background-image:url(${cast[i].actor.profile})"></div>
                    <div class="info">
                        <div class="actor">${cast[i].actor.name}</div>
                        <div class="character">${cast[i].character}</div>
                    </div>
                </div>
            `
            $('#item #info #cast').append(insertHTML)
        }
    }
    async setSeason(season){
        
        $('#item #info #seasonBar .insert').text(`Season ${season}`)
        $('#item #info #seasonScroll').scrollLeft(0).html('')
        $('#item #info #seasonBar #dropDown').fadeOut(0)

        const month = ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        const data = await media.getSeason(history.state.item.id, season)
        for(let i = 0; i < data.length; i++){
            
            let progress = await user.getProgress('show', history.state.item.id, data[i].id) 
            progress = progress.percent

            if(progress == 0){
                progress = await user.isInComplete('show', history.state.item.id, data[i].id) ? 100 : 0
            }

            const progress_html = progress > 0 ? `
                <div class="progressFrame">
                    <div class="progress" style="width:${progress}%"></div>
                </div>` : ''

            let html = `
                <div class="insert">
                    <div class="metadata">${data[i].id}</div>
                    <div class="still" style="background-image: url(${data[i].still})">
                        <div class="button"></div>
                        ${progress_html}
                    </div>
                    <div class="title">S${data[i].season}:E${data[i].episode} - ${data[i].title}</div>
                    <div class="date">${month[parseInt(String(data[i].date).slice(4,6))]} ${parseInt(String(data[i].date).slice(6,8))}, ${String(data[i].date).slice(0,4)}</div>
                </div>
            `
            $('#item #info #seasonScroll').append(html)
        } 
        $('#item #seasonBar .Nav .left').css({opacity:'0.2', cursor:'default', pointerEvents:'none'})
        $('#item #seasonBar .Nav .right').css({opacity: '1', cursor:'pointer', pointerEvents:'all'})
    }
}

const itemManager = new itemPageManager()

function setDimProperties(scroll_px){
    // console.log(scroll_px)
    const background_a = Math.min(scroll_px/200, .85)
    const background_clr = BACKGROUND_CLR + ',' + background_a
    $('#item #backdrop #blur').css('background-color', `rgba(${background_clr})`)

    const blur_a = Math.min(Math.trunc(scroll_px)/5, 30)
    $('#item #backdrop #blur').css('backdrop-filter', `blur(${blur_a}px)`)
}

document.getElementById('item').onscroll = function(){setDimProperties( $('#item').scrollTop())}

// ANIMATIONS
if($('#item #backdrop #main img').attr('src') == '') onStartAnimation()
else $('#item #backdrop #main img').on('load',function(){onStartAnimation()})
function onStartAnimation(){
    $('#item #backdrop #main img').stop(true, false).animate({
        width: '100%',
        marginLeft: '0',
    }, 1000)
    $('#item #info').stop(true, false).animate({
        opacity: 1
    }, 1500)
}

function setTab(tab){
    $('#item #info #cast, #item #info #director, #item #info #details').hide()
    if (tab == 'cast'){
        $('#item #info #cast').show()
    }
    else if (tab == 'director'){
        $('#item #info #director').show()
    }
    else if (tab == 'details'){
        $('#item #info #details').show()
    }
}

// ONCLICK
$('#item #info #playButton').click( async function(){
    let data = history.state.item
    if(history.state.item.type == 'show'){
        const cur = await user.currentEpisode(history.state.item.id)
        data = {type:'show', id:history.state.item.id, episodeID:cur.id}
    }
    pM.newPage('videoPlayer', data)
})


$(document).on('click', '#item #info #tabBar .insert', function(){
    console.log('CLICK')

    if($(this).text() != 'Cast') $('#item #tabBar .Nav').hide()
    else $('#item #tabBar .Nav').show()
    $('#item #info #cast, #item #info #director').scrollLeft(0)

    $('#item #tabBar .Nav .left').css({opacity: '0.2', cursor:'default'})
    $('#item #tabBar .Nav .right').css({opacity: '1', cursor:'pointer'})
})

$('#item #info #seasonBar .insert').click(function(){
    if($('#item #info #seasonBar #dropDown').is(':visible')) $('#item #info #seasonBar #dropDown').fadeOut(400)
    else $('#item #info #seasonBar #dropDown').fadeIn(400)
})

$(document).on('click', '#item #info #cast .insert, #item #info #director .insert', function(){
    let data = $(this).find('.metadata').text()
    data = JSON.parse(data)
    console.log(data)
    pM.newPage('actor_director', data)
})

$(document).on('click', '#item #info #seasonScroll #content .insert', function(){
    const eID = parseInt($(this).find('.metadata').text())
    pM.newPage('videoPlayer', {id:history.state.item.id, type:history.state.item.type, episodeID:eID})
})

$('#item #tabBar .Nav .left, #item #tabBar .Nav .right').click(function(){
    if(!$('#item #info #cast').is(":visible")) return
    else{
        const nav = $(this).parent()
        const element = $('#item #info #cast')
        const arrow = $(this).attr('class')
        const usable_width = element.width() - (BROWSE_MARGIN * 2) 
        
        const items_fit = Math.max(Math.trunc(usable_width / CREW_INSERT_WIDTH), 1)
        const scroll_length = items_fit * CREW_INSERT_WIDTH
        
        element.stop(true, true)
        const target = arrow == 'left' ? element.scrollLeft() - scroll_length : element.scrollLeft() + scroll_length
        
        element.animate({scrollLeft: target}, 300, function(){
            if(element.scrollLeft() == 0) nav.find('.left').css({opacity: '0.2', cursor:'default'})
            else nav.find('.left').css({opacity: '1', cursor:'pointer'})
    
            if(Math.abs(target - element.scrollLeft()) > 1 && arrow == 'right') nav.find('.right').css({opacity: '0.2', cursor:'default'})
            else nav.find('.right').css({opacity: '1', cursor:'pointer'})
        })
    }
})

$('#item #seasonBar .Nav .left, #item #seasonBar .Nav .right').click(function(){
    const nav = $(this).parent()
    const element = $('#item #info #seasonScroll')
    const arrow = $(this).attr('class')
    const usable_width = element.width() - (BROWSE_MARGIN * 2) 
    
    const items_fit = Math.max(Math.trunc(usable_width / EPISODE_WIDTH), 1)
    const scroll_length = items_fit * EPISODE_WIDTH
    const target = arrow == 'left' ? element.scrollLeft() - scroll_length : element.scrollLeft() + scroll_length
    
    element.stop(true, true).animate({scrollLeft: target}, 300)
})

// ON SCROLL
$('#item #info #seasonScroll').scroll(function(){

    const e = $(this) 

    if(e.scrollLeft() == 0) $('#item #seasonBar .Nav .left').css({opacity: '0.2', cursor:'default', pointerEvents:'none'})
    else $('#item #seasonBar .Nav .left').css({opacity: '1', cursor:'pointer', pointerEvents:'all'})

    if(Math.abs(e[0].scrollWidth - ((e.scrollLeft()) + e.width())) < 1) $('#item #seasonBar .Nav .right').css({opacity: '0.2', cursor:'default', pointerEvents:'none'})
    else $('#item #seasonBar .Nav .right').css({opacity: '1', cursor:'pointer', pointerEvents:'all'})
})

$('#item #info #cast').scroll(function(){
    const e = $(this)

    if(e.scrollLeft() == 0) $('#item #tabBar .Nav .left').css({opacity: '0.2', cursor:'default', pointerEvents:'none'})
    else $('#item #tabBar .Nav .left').css({opacity: '1', cursor:'pointer', pointerEvents:'all'})

    if(e[0].scrollWidth - ((e.scrollLeft()) + e.width()) < 1) $('#item #tabBar .Nav .right').css({opacity: '0.2', cursor:'default', pointerEvents:'none'})
    else $('#item #tabBar .Nav .right').css({opacity: '1', cursor:'pointer', pointerEvents:'all'})

})

// ON HOVER
$(document).on('mouseenter', '#item #info #seasonScroll #content .insert', function(){
    $(this).find('.still').stop(true, false).animate({
        backgroundSize: '103%'
    }, 600)
    $(this).find('.still').find('.button').stop(true, false).animate({opacity: 1}, 500)
}).on('mouseleave', '#item #info #seasonScroll #content .insert', function(){
    $(this).find('.still').stop(true, false).animate({
        backgroundSize:'100%'
    }, 900)
    $(this).find('.still').find('.button').stop(true, false).animate({opacity: 0}, 500)
})