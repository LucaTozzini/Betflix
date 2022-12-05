class populateHome{
    index = 0
    buildContinue(){
        return new Promise( async (resolve)=>{
            const data = await user.getContinue()
            if(data.length > 0) $('#home #continueContainer').css('display', 'flex')
            for(let i = 0; i < data.length; i++){
                
                let title = ''
                if(data[i].progress.episodeID != -1){
                    const eData = await media.getEpisode(data[i].item.id, data[i].progress.episodeID)
                    title = `S${eData.season}:E${eData.episode} - ${eData.title}`
                }

                this.index++
                const bookmarkIcon = await user.isInWatchlist(data[i].item.type, data[i].item.id) ? 'url(../img/icons/bookmark.png)' : 'url(../img/icons/bookmark_empty.png)'
                const html = `
                    <div class="insert" data-type="${data[i].item.type}" data-id="${data[i].item.id}" data-episodeID="${data[i].progress.episodeID}">
                        <div class="poster" style="background-image:url(${data[i].item.backdrop})" tabindex="${this.index}">
                            <div class="overlay">
                                <div class="top"></div>
                                <div class="logo" style="background-image:url(${data[i].item.logo})"></div>
                                <div class="bottom">
                                    <div class="band">
                                        <div class="section"></div>
                                        <h1>${title}</h1>
                                        <div class="section">
                                            <div id="watchlist_button" class="button" style="background-image: ${bookmarkIcon}"></div>
                                            <div id="info_button"      class="button" style="background-image: url(../img/icons/info.png)"></div>
                                            <div id="remove_button"    class="button" style="background-image: url(../img/icons/close.png)"></div>
                                        </div>
                                    </div>
                                    <div class="progressFrame">
                                        <div class="progress" style="width:${data[i].progress.percent}%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `
                $('#home #continueWatching').append(html)
            }

            return resolve()
        })
    }
    buildGenre(genre, sectionTitle){
        return new Promise( async (resolve)=>{
            let data = await media.getGenre(genre)
    
            let html = `
                <div class="sectionContainer">
                    <div class="sectionTitle">
                        ${sectionTitle}
                        <div class="Nav">
                            <div class="left"></div>
                            <div class="right"></div>
                        </div>
                    </div>
                    <div class="itemScroll">
                        <div class="browseMargin"></div>
            `
            for(let i = 0; i < data.length; i++){
                const bookmark_img = (await user.isInWatchlist(data[i].type, data[i].id)) ?  '../img/icons/bookmark.png' : '../img/icons/bookmark_empty.png' 
                this.index++
                html += await html_insert(data[i].type, data[i].id, data[i].title, data[i].year, data[i].poster, bookmark_img, this.index)
                if(i+1 < data.length) html +='<div class="dividor"></div>'
                else{
                    html += '<div class="browseMargin"></div></div></div>'
                }
            }
            if(data.length >= MIN_ITEMS_IN_SECTION) $('#homeSections').append(html)
            resolve()
        })
        
    }
    async mainBuild(){
        await this.buildContinue()
        await this.buildGenre('Action', 'Action')
        await this.buildGenre('Crime', 'Crime')
        await this.buildGenre('Thriller', 'Thrillers')
        await this.buildGenre('Comedy', 'Comedies')
        await this.buildGenre('Drama', 'Dramas')
        await this.buildGenre('Horror', 'Horror')
        await this.buildGenre('Animation', 'Animated')
        await this.buildGenre('Mystery', 'Mysteries')
        await this.buildGenre('Sci_Fi', 'Sci-Fi')
        await this.buildGenre('Documentary', 'Documentaries')
    }
}

// ON CLICK
$('#continueWatching_SectionTitle .Nav .left, #continueWatching_SectionTitle .Nav .right').click(function(){
    const e = $('#home #continueWatching')
    e.stop(true,true)
    const target = $(this).attr('class') == 'left' ? e.scrollLeft() - e.width() : e.scrollLeft() + e.width()
    e.css("scroll-snap-type", "none")
    e.animate({scrollLeft:target},300, ()=>{e.css("scroll-snap-type", "x mandatory")})
})

$(document).on('click', '#home #continueWatching .insert .poster', async function(e){
    
    const target = e.target.id
    const frame = $(this).parent() //.insert
    let data = {type:frame.attr("data-type"), id:frame.data("id"), episodeID:parseInt(frame.attr("data-episodeID"))}

    if(target == 'watchlist_button'){
        const all_el = $(`.frame[data-id='${data.id}'][data-type='${data.type}']`).find('.button.overlayWatchlist')
        const all_cont = $(`#continueContainer .insert[data-id='${data.id}'][data-type='${data.type}']`).find('#watchlist_button')
        if(await user.isInWatchlist(data.type, data.id)){
            const success = await user.removeFromWatchlist(data.type, data.id)
            if(success){
                all_el.css('background-image', 'url(../img/icons/bookmark_empty.png)')
                all_cont.css('background-image', 'url(../img/icons/bookmark_empty.png)')
            }
        }
        else{
            const success = await user.addToWatchlist(data.type, data.id)
            if(success){
                all_el.css('background-image', 'url(../img/icons/bookmark.png)')
                all_cont.css('background-image', 'url(../img/icons/bookmark.png)')
            }
        }
    }
    else if (target == 'info_button') pM.newPage('item', {type:data.type, id:data.id})
    else if (target == 'remove_button'){
        user.deleteContinue(data.type, data.id, data.episodeID)

        if ($(this).parent().parent().children().length == 1) $(this).parent().parent().parent().remove()
        else $(this).parent().remove()
    }
    else pM.newPage('videoPlayer', data)
    
})

// ON SCROLL
$('#home #continueWatching').scroll(()=>{
    const e = $('#home #continueWatching')
    const left = $('#continueWatching_SectionTitle .Nav .left')
    const right = $('#continueWatching_SectionTitle .Nav .right')

    if(e.scrollLeft() == 0) left.css({opacity:'0.2', cursor:'default', pointerEvents:'none'})
    else left.css({opacity:'1', cursor:'pointer', pointerEvents:'all'})

    if(e[0].scrollWidth - (e.scrollLeft() + e.width()) < 1) right.css({opacity:'0.2', cursor:'default', pointerEvents:'none'})
    else right.css({opacity:'1', cursor:'pointer', pointerEvents:'all'})
})

// ON HOVER

$(document).on('mouseover', '#home #continueWatching .insert .poster', function(){
    $(this).stop(true, false).animate({backgroundSize: '85%', 'background-position-x': "110%"}, 2000)
}).on('mouseleave', '#home #continueWatching .insert .poster', function(){
    $(this).stop(true, false).animate({backgroundSize: '80%', 'background-position-x': "100%"}, 400)
})