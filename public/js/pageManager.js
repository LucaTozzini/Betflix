// ON START
if(history.state == null){
    history.replaceState({'page':'home', 'item':{}}, '', '#home')
}
class pageManager{
    #page
    constructor(page){
        this.#page = page
    }
    async setPage(){
        document.title = `${this.#page.charAt(0).toUpperCase() + this.#page.substring(1).toLowerCase()} | Stream on Betflix`

        $('#top .insert .text').css('color', 'var(--navTextColor)')
        $('#main #browse').children().hide()
        if(this.#page == 'home'){
            $('#top .insert#homeTab .text').css('color', 'var(--navHighlight)')

            $('#main #browse #home').show()

            const popHome = new populateHome(localStorage.getItem('userID'))
            popHome.mainBuild()

        }
        else if(this.#page == 'watchlist'){
            $('#top .insert#watchlistTab .text').css('color', 'var(--navHighlight)')

            $('#main #browse #watchlist').show()

            const popWatch = new populateWatchlist(localStorage.getItem('userID'))
            popWatch.mainBuild()
        }
        else if(this.#page == 'search'){
            $('#top .insert#searchTab .text').css('color', 'var(--navHighlight)')
            $('#main #browse #search').show()
            checkSearchValue()
        }
        else if(this.#page == 'settings'){
            $('#top .insert#settingsTab .text').css('color', 'var(--navHighlight)')

            $('#main #browse #settings').show()
        }
        else if(this.#page == 'item'){
            $('#main #browse #item').show()
            setTab('cast')

            // SET DATA
            const itemManager = new itemPageManager()
            itemManager.setData(history.state.item.type, history.state.item.id)
        }
        else if(this.#page == 'videoPlayer'){
            $('#main #browse #videoPlayer').show()
            $('#main #browse #videoPlayer').css({opacity:1})
            $('#main #top').hide()

            await stream.start()
            stream.setData()
            stream.updateContinue()
        }
        else if(this.#page == 'actor_director'){
            $('#main #browse #actor_director').show()
            const person = await media.getPerson(history.state.item.type, history.state.item.id)
            $('#main #browse #actor_director #header img').attr('src', person.profile)
            $('#main #browse #actor_director #header h1').text(person.name)
            
            const month = [null,"January","February","March","April","May","June","July","August","September","October","November","December"];
            let date = person.birthday != null ? `${month[parseInt(person.birthday.split('-')[1])]} ${parseInt(person.birthday.split('-')[2])}, ${person.birthday.split('-')[0]}` : ''
            if(person.deathday != null) date += ` - ${month[parseInt(person.deathday.split('-')[1])]} ${parseInt(person.deathday.split('-')[2])}, ${person.deathday.split('-')[0]}`
            $('#main #browse #actor_director #header h3').text(date)
            $('#main #browse #actor_director #header p').text(person.bio)

            const catalog = await media.getCatalog('actor', history.state.item.id)
            console.log(catalog)
            let html = ''
            for(let i = 0; i < catalog.length; i++){
                const item = await media.search(catalog[i].type, catalog[i].id)
                const bookmark_img = (await user.isInWatchlist(item.type, item.id)) ?  '../img/icons/bookmark.png' : '../img/icons/bookmark_empty.png' 
                html += await html_insert(item.type, item.id, item.title, item.year, item.poster, bookmark_img, i+1)
                html += i+1 < catalog.length ? '<div class="dividor"></div>' : '<div class="browseMargin"></div>' 
            }
            if(catalog.length == 0) $('#main #browse #actor_director .sectionContainer.acted').hide()
            else $('#main #browse #actor_director .sectionContainer.acted .itemScroll').append(html)

            const dir_catalog = await media.getCatalog('director', history.state.item.id)
            html = ''
            for(let i = 0; i < dir_catalog.length; i++){
                const item = await media.search(dir_catalog[i].type, dir_catalog[i].id)
                const bookmark_img = (await user.isInWatchlist(item.type, item.id)) ?  '../img/icons/bookmark.png' : '../img/icons/bookmark_empty.png' 
                html += await html_insert(item.type, item.id, item.title, item.year, item.poster, bookmark_img, i+1)
                html += i+1 < dir_catalog.length ? '<div class="dividor"></div>' : '<div class="browseMargin"></div>' 
            }
            console.log(dir_catalog.length)
            if(dir_catalog.length == 0) $('#main #browse #actor_director .sectionContainer.directed').hide()
            else $('#main #browse #actor_director .sectionContainer.directed .itemScroll').append(html)

        }
        this.pageAutoCheck(.5)
    }
    newPage(page, item){
        // (string) page = 'name of new page'
        // (object) item = { id:1234; type:'movie or show' }
        if(page != this.#page){
            history.pushState({'page':page, 'item':item}, '', `#${page.toUpperCase()}`)
            window.location.reload()
        }
    }
    async pageAutoCheck(seconds){
        //re-sets page when navigating back through history
        while(true){
            if(history.state.page != this.#page){
                window.location.reload()
            }
            await new Promise((resolve)=>{
                setTimeout(()=>{
                    resolve()
                }, seconds * 1000)
            })
        }
    }
    async screen_blocker(type, itemType, itemID){
        $('#screen_blocker').css('display', 'flex')
        $('#screen_blocker').children().hide()

        if(type == 'overview'){
            const data = await media.search(itemType, itemID)
            $('#screen_blocker #overview .title').text(data.title)
            $('#screen_blocker #overview .text').text(data.overview)
            $('#screen_blocker #overview').show()
        }
        else if(type == 'edit'){
            const title = await media.getTitle(itemType, itemID)
            const posters = await database.getPosters(itemType, itemID)
            const backdrops = await database.getBackdrops(itemType, itemID)
            const logos = await database.getLogos(itemType, itemID)

            $('#screen_blocker #edit .title').text(title)

            let p_html = ''
            for(let i = 0; i < posters.length; i++){
                p_html += `
                    <div class="poster" style="background-image:url('${posters[i]}')" onclick="database.updatePoster('${itemType}',${itemID},'${posters[i]}')">
                        <div class="overlay"> SET </div>
                    </div>`
            }
            $('#screen_blocker #edit .content.posters').html(p_html)

            let b_html = ''
            for(let i = 0; i < backdrops.length; i++){
                b_html += `
                <div class="backdrop" style="background-image:url('${backdrops[i]}')" onclick="async function update(){ await database.updateBackdrop('${itemType}',${itemID},'${backdrops[i]}'); pM.setPage() }; update()">
                    <div class="overlay"> SET </div>
                </div>`
            }
            $('#screen_blocker #edit .content.backdrops').html(b_html)

            let l_html = ''
            for(let i = 0; i < logos.length; i++){
                l_html += `
                <div class="backdrop" style="background-image:url('${logos[i]}')" onclick="async function update(){ await database.updateLogo('${itemType}',${itemID},'${logos[i]}'); pM.setPage() }; update()">
                    <div class="overlay"> SET </div>
                </div>`
            }
            $('#screen_blocker #edit .content.logos').html(l_html)

            $('#screen_blocker #edit').show()
        }
    }
}
const pM = new pageManager(history.state.page)
pM.setPage()

//WATCHLIST ADD/REMOVE ONCLICK
$('#item #addWatchlistButton').click(async()=>{
    const success = await user.addToWatchlist(history.state.item.type, history.state.item.id)
    if(success){
        $('#item #addWatchlistButton').hide()
        $('#remWatchlistButton').show()
    }
})
$('#item #remWatchlistButton').click(async()=>{
    const success = await user.removeFromWatchlist(history.state.item.type, history.state.item.id)
    if(success){
        $('#item #addWatchlistButton').show()
        $('#remWatchlistButton').hide()
    }
})