$('#main #browse').children().hide()

// SET VAR
const MIN_ITEMS_IN_SECTION = 1

//CSS VARIABLES
const CONT_WATCH_HEIGHT  = getComputedStyle(document.documentElement).getPropertyValue('--continueWatchingHeight').replace('px', '')
const ITEM_INSERT_HEIGHT = getComputedStyle(document.documentElement).getPropertyValue('--itemInsertHeight').replace('px', '')
const BACKGROUND_CLR     = getComputedStyle(document.documentElement).getPropertyValue('--backgroundColor').replace(/[^0-9,]/g, '')
const TOP_CLR            = getComputedStyle(document.documentElement).getPropertyValue('--topColor').replace(/[^0-9,]/g, '')
const KNOB_SIZE          = getComputedStyle(document.documentElement).getPropertyValue('--progressBarKnobSize').trim()
const SMALL_KNOB_SIZE    = getComputedStyle(document.documentElement).getPropertyValue('--progressBarKnobSizeSmall').trim()
const BROWSE_MARGIN      = getComputedStyle(document.documentElement).getPropertyValue('--browseMarginWidth').replace('px', '')
const DIVIDOR_WIDTH      = getComputedStyle(document.documentElement).getPropertyValue('--itemScrollDividorWidth').replace('px', '')
const CREW_INSERT_WIDTH  = 140
const EPISODE_WIDTH      = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--episodeWidth').replace('px', '')) + 20

//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
class userManager{
    #userID
    constructor(userID){
        this.#userID = userID
        this.checkAuthentication()
    }
    async checkAuthentication(){
        const options = {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
                'id': this.#userID
            })
        }
        let data = await fetch('/userAPI/getUser', options)
        data = await data.json()
        if(data.id == -1) window.location.replace('logIn.html')
    }
    addToWatchlist(type, id){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST', // or 'PUT' 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id:this.#userID, itemType: type, itemID: id}),
            }
            let success = await fetch('/userAPI/addToWatchlist', options)
            success = await success.json()
            resolve(success)
        })
    }
    removeFromWatchlist(type, id){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id:this.#userID, itemType: type, itemID: id}),
            }
            let success = await fetch('/userAPI/removeFromWatchlist', options)
            success = await success.json()
            resolve(success)
        })
    }
    isInWatchlist(type, id){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({id:this.#userID, itemType: type, itemID: id}),
            }
            let found = await fetch('/userAPI/isInWatchlist', options)
            found = await found.json()
            resolve(found)
        })
    }
    isInComplete(type, itemID, episodeID){
        return new Promise( async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID, 
                    itemType:type, 
                    itemID: itemID, 
                    episodeID: episodeID
                }),
            }
            let success = await fetch('/userAPI/isInComplete', options)
            success = await success.json()
            resolve(success)
        })
    }
    getWatchlist(){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    'id':this.#userID
                })
            }
            let data = await fetch('/userAPI/getWatchlist', options)
            data = await data.json()
            resolve(data)
        })
    }
    updateContinue(type, itemID, episodeID, percent){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST', // or 'PUT' 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID, 
                    itemType: type, 
                    itemID: itemID,
                    episodeID: episodeID,
                    percent:percent
                }),
            }
            let success = await fetch('/userAPI/updateContinue', options)
            success = await success.json()
            resolve(success)
        })
    }
    getContinue(){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID
                }),
            }
            let data = await fetch('/userAPI/getContinue', options)
            data = await data.json()
            resolve(data)
        })
    }
    getProgress(itemType, itemID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID,
                    itemType: itemType, 
                    itemID: itemID,
                    episodeID: episodeID
                }),
            }
            let data = await fetch('/userAPI/getProgress', options)
            data = await data.json()
            resolve(data)
        })
    }
    deleteContinue(itemType, itemID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID,
                    itemType: itemType, 
                    itemID: itemID,
                    episodeID: episodeID
                }),
            }
            let data = await fetch('/userAPI/deleteContinue', options)
            data = await data.json()
            resolve(data)
        })
    }
    currentEpisode(itemID){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID,
                    itemID: itemID
                }),
            }
            let data = await fetch('/userAPI/currentEpisode', options)
            data = await data.json()
            resolve(data)
        }) 
    }
    addComplete(type, itemID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID,
                    itemType:type,
                    itemID: itemID,
                    episodeID: episodeID
                }),
            }
            let data = await fetch('/userAPI/addComplete', options)
            data = await data.json()
            resolve(data)
        }) 
    }
    setNext(itemID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id:this.#userID,
                    itemID: itemID,
                    episodeID: episodeID
                }),
            }
            let data = await fetch('/userAPI/setNext', options)
            data = await data.json()
            resolve(data)
        }) 
    }
}
class mediaManager{
    search(type, id){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id, type})
            }
            let data = await fetch(`/mediaAPI/search`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    searchTitle(title){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({title})
            }
            let data = await fetch(`/mediaAPI/searchTitle`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    getTitle(type, id){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST', 
                headers:{'Content-Type':'application/json'}, 
                body:JSON.stringify({type, id})
            }
            let data = await fetch('/mediaAPI/getTitle', options)
            data = await data.json()
            console.log(data)
            let title = "title" in data ? data.title : "ERROR: NO TITLE"
            if("season" in data && type == 'show'){
                title = `S${data.season}:E${data.episode} - ${title}`
            }
            resolve(title)
        })
    }
    getGenre(genre){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({genre})
            }
            let data = await fetch(`/mediaAPI/getGenre`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    getCast(id, type){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type
                })
            }
            let data = await fetch(`/mediaAPI/getCast`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    getMovieDirector(id){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id})
            }
            let data = await fetch('/mediaAPI/getMovieDirectors', options)
            data = await data.json()
            return resolve(data)
        })
    }
    getSeason(id, season){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    season
                })
            }
            let data = await fetch('/mediaAPI/getSeason', options)
            data = await data.json()
            return resolve(data) 
        })
    }
    firstEpisode(id){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id
                })
            }
            let data = await fetch('/mediaAPI/firstEpisode', options)
            data = await data.json()
            data = "id" in data ? data.id : -1
            return resolve(data) 
        })
    }
    firstSeason(id){
        return new Promise(async(resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id
                })
            }
            let data = await fetch('/mediaAPI/firstSeason', options)
            data = await data.json()
            data = "season" in data ? data.season : -1
            return resolve(data) 
        })
    }
    getEpisode(showID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id:showID,
                    episodeID
                })
            }
            let data = await fetch('/mediaAPI/getEpisode', options)
            data = await data.json()
            return resolve(data) 
        })
    }
    nextEpisode(showID, episodeID){
        return new Promise(async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id:showID,
                    episodeID
                })
            }
            let data = await fetch('/mediaAPI/nextEpisode', options)
            data = await data.json()
            return resolve(data) 
        })
    }
    getRatingDescription(type, rating){
        return new Promise(async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    type,
                    rating
                })
            }
            let data = await fetch('/mediaAPI/getRatingDescription', options)
            data = await data.json()
            return resolve(data) 
        }) 
    }
    seasonList(id){
        return new Promise(async resolve=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id})
            }
            let data = await fetch('/mediaAPI/seasonList', options)
            data = await data.json()
            return resolve(data) 
        }) 
    }
    getPerson(type, id){
        return new Promise(async resolve=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id, type})
            }
            let data = await fetch('/mediaAPI/getPerson', options)
            data = await data.json()
            return resolve(data) 
        })
    }
    getCatalog(type, id){
        return new Promise(async resolve=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({id, type})
            }
            let data = await fetch('/mediaAPI/getCatalog', options)
            data = await data.json()
            return resolve(data)
        })
    }
}
class databaseManager{
    getPosters(type, id){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type
                })
            }
            let data = await fetch(`/databaseAPI/getPosters`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    updatePoster(type, id, poster){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type,
                    poster
                })
            }
            let data = await fetch(`/databaseAPI/updatePoster`, options)
            data = await data.json()
            console.log(data)
            return resolve(data)
        })
    }

    getBackdrops(type, id){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type
                })
            }
            let data = await fetch(`/databaseAPI/getBackdrops`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    updateBackdrop(type, id, backdrop){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type,
                    backdrop
                })
            }
            let data = await fetch(`/databaseAPI/updateBackdrop`, options)
            data = await data.json()
            console.log(data)
            return resolve(data)
        })
    }

    getLogos(type, id){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type
                })
            }
            let data = await fetch(`/databaseAPI/getLogos`, options)
            data = await data.json()
            return resolve(data)
        })
    }
    updateLogo(type, id, logo){
        return new Promise( async (resolve)=>{
            const options = {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    id,
                    type,
                    logo
                })
            }
            let data = await fetch(`/databaseAPI/updateLogo`, options)
            data = await data.json()
            console.log(data)
            return resolve(data)
        })
    }
}
const user = new userManager(localStorage.getItem('userID'))
const media = new mediaManager()
const database = new databaseManager()

function html_insert(type, id, title, year, poster_img, bookmark_img, index){
    return new Promise((resolve)=>{
        const html = `
            <div class="frame">
                <div class="metadata">${JSON.stringify({id:id, type:type, episodeID:-1})}</div>
                <div class="box">
                    <div class="itemInsert" style="background-image: url(${poster_img})" tabindex="${index}">
                        <div class="overlay">
                            <div class="controls">
                                <div class="button overlayWatchlist" style="background-image:url(${bookmark_img})"></div>
                                <div class="button overlayPlay"      style="background-image:url(../img/icons/play.png)"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="info">
                    <div class="title">${title}</div>
                    <div class="year">${year}</div>
                </div>
            </div>
        `
        return resolve(html)
    })
}

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx



$('#top #user').css('background-image', `url(img/profilePictures/${localStorage.getItem('userImg')})`)

// ITEMS: ON HOVER
$(document).on('mouseenter', '.itemScroll .frame .itemInsert', function(){
    $(this).stop(true, false).animate({
        height: '100%',
        width:  '100%'
    }, 300)

    $(this).find('.overlay').stop(true, false).animate({
        opacity:'1'
    }, 150)

    $(this).find('.controls .button').stop(true, false).animate({
        opacity: '1'
    }, 150)

}).on('mouseleave', '.itemScroll .frame .itemInsert', function(){
    $(this).stop(true, false).animate({
        height: '97%',
        width:  '97%',
    }, 300)

    $(this).find('.overlay').stop(true, false).animate({
        opacity:'0'
    }, 300)

    $(this).find('.controls .button').stop(true, false).animate({
        opacity: '0'
    }, 200)
})

// ITEM: ON CLICK
$(document).on('click', '.itemScroll .frame .itemInsert .overlay', async function(e){
    let data = $(this).parent().parent().parent().find('.metadata').text()
    data = JSON.parse(data)
    if(e.target.className == 'button overlayWatchlist'){
        if(await user.isInWatchlist(data.type, data.id)){
            const success = await user.removeFromWatchlist(data.type, data.id)
            if(success) $(e.target).css('background-image', 'url(../img/icons/bookmark_empty.png)')
        }
        else{
            const success = await user.addToWatchlist(data.type, data.id)
            if(success) $(e.target).css('background-image', 'url(../img/icons/bookmark.png)')
        }
    }
    else if(e.target.className == 'button overlayPlay'){
        if(data.type == 'show'){
            const cur = await user.currentEpisode(data.id)
            data.episodeID = cur.id
        } 
        pM.newPage('videoPlayer', data)
    }
    else pM.newPage('item', data)
})
$(document).on('click', '.itemScroll .frame .info .title', async function(){
    let data = $(this).parent().parent().parent().find('.metadata').text()
    data = JSON.parse(data)
    if(data.type == 'show'){
        const cur = await user.currentEpisode(data.id)
        data.episodeID = cur.id
    } 
    pM.newPage('item', data)
})

// SCROLL NAV ARROWS
$(document).on('click', '.sectionTitle .Nav .left, .sectionTitle .Nav .right', async function(){
    const nav = $(this).parent()
    const arrow = $(this).attr('class')
    const itemScroll = $(this).parent().parent().parent().find('.itemScroll')

    const usable_width = itemScroll.width() - (BROWSE_MARGIN * 2)
    const item_width = ITEM_INSERT_HEIGHT * .67

    let items_fit = Math.trunc(usable_width / item_width)

    while((items_fit * item_width) + (DIVIDOR_WIDTH * (items_fit - 1)) > usable_width){
        items_fit -= 1
        if(items_fit <= 1) break
    }

    items_fit = Math.max(items_fit, 1)
    
    const scroll_length = (items_fit * item_width) + (DIVIDOR_WIDTH * items_fit)

    itemScroll.stop(true, true)
    const target = arrow == 'left' ? itemScroll.scrollLeft() - scroll_length : itemScroll.scrollLeft() + scroll_length
    
    itemScroll.animate({scrollLeft: target}, 300)
})

// ONSCROLL
document.addEventListener('scroll', function (event) {
    if(event.target.className === 'itemScroll'){
        const itemScroll = event.target
        const nav = event.target.parentElement.children[0].children[0]
        if(itemScroll.scrollLeft == 0){
            nav.children[0].style.opacity = 0.2
            nav.children[0].style.cursor = 'default'
            nav.children[0].style.pointerEvents = 'none'
        }
        else{
            nav.children[0].style.opacity = 1
            nav.children[0].style.cursor = 'pointer'
            nav.children[0].style.pointerEvents = 'all'
        }

        if(itemScroll.scrollWidth - (itemScroll.scrollLeft + itemScroll.clientWidth) < 2){
            nav.children[1].style.opacity = 0.2
            nav.children[1].style.cursor = 'default'
            nav.children[1].style.pointerEvents = 'none'
        }
        else{
            nav.children[1].style.opacity = 1
            nav.children[1].style.cursor = 'pointer'
            nav.children[1].style.pointerEvents = 'all'
        }
    }
}, true);

$( "#home, #watchlist, #setting, #item, #setting, #search, #actor_director" ).scroll(function() {
    const y = $(this).scrollTop()
    let a = y == 0 ? 0 : 1
    $('#main #top').css('background-color', `rgba(${TOP_CLR},${a})`)

    if($("#item").is(':visible')){
        if(a == 1){
            $('#item #backdrop #blur').css('height', 'var(--itemDimHeightScroll)')
            $('#item #backdrop #blur').css('margin-top', 'var(--itemDimMarginScroll)')
        }
        else{
            $('#item #backdrop #blur').css('height', '100vh')
            $('#item #backdrop #blur').css('margin-top', '-100vh')
        }
    }

});


// SCREEN_BLOCKER
$('#screen_blocker .content.backdrops, #screen_blocker .content.logos').hide()
$('#screen_blocker #tabs .insert').click((e)=>{
    const target = e.target.className
    console.log(target)
    $('#screen_blocker .content').hide()
    if(target == 'insert posters'){
        $('#screen_blocker .content.posters').show()
    }
    else if(target == 'insert backdrops'){
        $('#screen_blocker .content.backdrops').show()
    }
    else if(target == 'insert logos'){
        $('#screen_blocker .content.logos').show()
    }
})