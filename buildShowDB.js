const { resolve } = require('path');
const https = require('https');

const fs = require('fs')
const sqlite3 = require('sqlite3').verbose()
const { getVideoDurationInSeconds } = require('get-video-duration');
var episode = require('episode'); //https://www.npmjs.com/package/episode


const TMDB_KEY         = '99c6bddf93662b05e7e8f0a1303cbca5'
const TMDB_IMG_BASE    = 'https://image.tmdb.org/t/p/w500'
const TMDB_O_IMG_BASE  = 'https://image.tmdb.org/t/p/original'
const SHOW_PATH        = './media/shows/'
const REL_SHOW_PATH    = './media/shows/'
const MEDIA_DB         = 'data/media.db'
const SHOW_DB          = 'data/media/show.db'
const CAST_DB          = 'data/cast.db'

class db_manager{
    #showDB
    #mediaDB
    constructor(){
        this.#showDB = new sqlite3.Database(SHOW_DB, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};console.log("ShowDB initialized")})
        this.#mediaDB = new sqlite3.Database(MEDIA_DB, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};console.log("MediaDB initialized")})
        this.#mediaDB.run('CREATE TABLE show(id, title, year, start_date, end_date, genres, overview, vote, num_seasons, num_episodes, content_rating, poster, logo, backdrop, path, type, cast, studio)', (err)=>{if(err)console.error(err.message); else console.log('ShowDB "list" CREATED')})
    }
    canAdd(id, table, database){
        return new Promise((resolve)=>{
            database.get(`SELECT * FROM "${table}" WHERE id=${id} LIMIT 1`, (err, row)=>{
                if(err){
                    console.error('canAdd ERROR: ',id,table,err.message)
                    return resolve(false)
                }
                if(row == null) return resolve(true)
                else return resolve(false)
            })
        })
    }
    async add(id, title, year, start_date, end_date, genres, overview, vote, num_seasons, num_episodes, content_rating, poster, logo, backdrop, path, cast, studio){
        if(await this.canAdd(id, 'show', this.#mediaDB)){
            this.#mediaDB.run(`INSERT INTO show(id, title, year, start_date, end_date, genres, overview, vote, num_seasons, num_episodes, content_rating, poster, logo, backdrop, path, type, cast, studio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [id, title, year, start_date, end_date, genres, overview, vote, num_seasons, num_episodes, content_rating, poster, logo, backdrop, path, 'show', cast, studio])
        }
        for(let i = 0; i < genres.length; i++){
            this.#mediaDB.run(`CREATE TABLE IF NOT EXISTS ${genres[i]}(type, id)`, async(err)=>{
                if(err) return console.error('ADD ERROR: ',title, err.message)
                if(await this.canAdd(id, genres[i], this.#mediaDB)){
                    this.#mediaDB.run(`INSERT INTO ${genres[i]}(type, id) VALUES (?,?)`, ['show',id], (err)=>{if(err) console.error(err.message)})
                }
            })
        }
    }
    addEpisode(showID, id, season, episode, title, date, overview, vote, duration, still, path){
        return new Promise(async(resolve)=>{
            if(await this.canAdd(id, showID, this.#showDB)) this.#showDB.run(`INSERT INTO "${showID}"(id, season, episode, title, date, overview, vote, duration, still, path) VALUES (?,?,?,?,?,?,?,?,?,?)`, [id, season, episode, title, date, overview, vote, duration, still, path], (err)=>{if(err) return resolve(false); else return resolve(true)})
            else return resolve(true)
        })
    }
    createTable(id){
        return new Promise((resolve)=>{
            this.#showDB.run(`CREATE TABLE IF NOT EXISTS "${id}"(id, season, episode, title, date, overview, vote, duration, still, path)`, async(err)=>{
                if(err){console.error('CREATE TABLE '+err.message);return resolve(false)}
                return resolve(true)  
            })
        })
    }
}

class crew_manager{
    #DB
    constructor(DatabasePath){
        this.#DB = new sqlite3.Database(DatabasePath, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};console.log("castDB initialized")})
        this.#DB.run('CREATE TABLE list(id, name, gender, profile, bio, birthday, deathday)', (err)=>{
            if(err) return console.error(err.message)
            else return console.log('CAST "list" TABLE created')
        })
    }
    isIn(id){
        return new Promise((resolve)=>{
            this.#DB.get(`SELECT * FROM list WHERE id=${id}`, (err, row)=>{
                if(err) console.error(err.message)
                if(row == undefined) return resolve(false)
                else return resolve(true)
            })
        })
    }
    add(id, name, gender, profile, bio, birthday, deathday){
        return new Promise(async (resolve)=>{
            if(!await this.isIn(id)){
                this.#DB.run(`INSERT INTO list(id, name, gender, profile, bio, birthday, deathday) VALUES (?,?,?,?,?,?,?)`, [id, name, gender, profile, bio, birthday, deathday], (err)=>{
                    if(err){
                        console.error(err.message)
                        return resolve(false)
                    }  
                    else return resolve(true)
                })
            }
        })
    }
    createPersonTable(id){
        return new Promise((resolve)=>{
            this.#DB.run(`CREATE TABLE '${id}'(type, id)`, (err)=>{
                if (err) {}//console.error('@ line 95 | ' + err.message)
                return resolve(true)
            })
        })
    }
    hasShow(id, showID){
        return new Promise((resolve)=>{
            this.#DB.get(`SELECT * FROM '${id}' WHERE id=${showID} AND type="show"`, (err, row)=>{
                if(err) console.error(err.message)
                if(row == undefined) return resolve(false)
                return resolve(true)
            })
        })
    }
    addToPerson(id, showID){
        return new Promise(async (resolve)=>{
            if(!await this.hasShow(id, showID)){
                this.#DB.run(`INSERT INTO '${id}'(type, id) VALUES (?,?)`, ['show', showID], (err)=>{
                    if (err) console.error('@ line 113 |' + err.message)
                })
            }
            return resolve(true)
        })
    }
}

class TMDB_API{
    getJSON(url){
        return new Promise((resolve)=>{
            https.get(url ,(res) => {
                let body = "";
            
                res.on("data", (chunk) => {
                    body += chunk;
                });
            
                res.on("end", () => {
                    try {
                        let json = JSON.parse(body);
                        resolve(json)
                    } catch (error) {
                        console.error(error.message);
                        resolve({'error':error.message})
                    };
                });
            
            }).on("error", (error) => {
                console.error(error.message);
                resolve({'error':error.message})    
            });
        })
    }
    search(title, year){
        return new Promise(async(resolve)=>{
            try{

                // SEARCH
                let match = null, data = await this.getJSON(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&language=en&query=${title}`) 
                data = data.results
                if(data.length == 0){console.log("\x1b[31m",`NO MATCH FOR ${title}`);return resolve(null)} 
                // GET BEST MATCH
                for(let i = 0; i < data.length; i++){
                    if(!('first_air_date' in data[i]))continue
                    else if(data[i].name == title && parseInt(data[i].first_air_date.split('-')[0]) == year){match = data[i]; break}
                    else if(parseInt(data[i].first_air_date.split('-')[0]) == year && match == null) match = data[i] 
                }
                if(match == null) match = data[0]
                match = await this.getJSON(`https://api.themoviedb.org/3/tv/${match.id}?api_key=${TMDB_KEY}&language=en`)
                console.log("\x1b[32m", 'Match Found')

                // GET STUDIO
                let studio = 'Unknown'
                if('production_companies' in match){if(match.production_companies.length > 0) studio = match.production_companies[0].name}
    
                // GET LOGO
                let logo_path = await this.getJSON(`https://api.themoviedb.org/3/tv/${match.id}/images?api_key=${TMDB_KEY}&language=en`)
                if(logo_path.logos.length > 0) logo_path = TMDB_IMG_BASE + logo_path.logos[0].file_path
                else logo_path = null
    
                // PARSE GENRES
                let genres = []
                for(let i = 0; i < match.genres.length; i++){
                    let id = match.genres[i].name
                    if(id.includes(' & ')){
                        id = id.split(' & ')
                        genres.push(id[0].replace(/[^A-Za-z]/g, '_'))
                        genres.push(id[1].replace(/[^A-Za-z]/g, '_'))
                    }
                    else genres.push(match.genres[i].name.replace(/[^A-Za-z]/g, '_'))
                }
                console.log("\x1b[0m", "Genres Found")
    
                // GET CONTENT RATING
                let rating
                let content_ratings = await this.getJSON(`https://api.themoviedb.org/3/tv/${match.id}/content_ratings?api_key=${TMDB_KEY}`)
                content_ratings = content_ratings.results
                
                for(let i = 0; i < content_ratings.length; i++){
                    if(content_ratings[i].iso_3166_1 == 'US'){
                        rating = content_ratings[i].rating
                        if(rating != '') break
                    }
                }
                if(rating == '') rating = 'NR'
                console.log('Rating Found')
    
                // SEARCH CREDITS
                const credits = await this.getJSON(`https://api.themoviedb.org/3/tv/${match.id}/aggregate_credits?api_key=${TMDB_KEY}`)
                
                // SCAN CAST
                let cast_list = []
                for(let i = 0; i < credits.cast.length; i++){
                    
                    process.stdout.write('Scanning Cast - ' + (i+1) + ' / ' + credits.cast.length)
    
                    const actor = credits.cast[i]
                    if(actor.profile_path == null) actor.profile_path = './img/missing-profile.png'
                    else actor.profile_path = TMDB_IMG_BASE + actor.profile_path
                    
                    
                    const actor_data = await this.getJSON(`https://api.themoviedb.org/3/person/${actor.id}?api_key=${TMDB_KEY}&language=en`)
                    cast.add(actor.id, actor.name, actor.gender, actor.profile_path, actor_data.biography, actor_data.birthday, actor_data.deathday)
                    


                    await cast.createPersonTable(actor.id)
                    await cast.addToPerson(actor.id, match.id)
                    cast_list.push({actor:actor.id, character:actor.roles[0].character})
    
                    if(i + 1 < credits.cast.length){
                        process.stdout.clearLine();  // clear current text
                        process.stdout.cursorTo(0);  // move cursor to beginning of line
                    }
                }
                console.log()
    
                // BUILD DATA
                match = {
                    id: match.id,
                    title: match.name,
                    year: parseInt(match.first_air_date.split('-')[0]),
                    start_date: parseInt(match.first_air_date.replace(/[^0-9]/g, '')),
                    end_date: parseInt(match.last_episode_to_air.air_date.replace(/[^0-9]/g, '')),
                    genres: genres.sort(),
                    overview: match.overview,
                    vote: match.vote_average,
                    num_seasons: match.number_of_seasons,
                    num_episodes: match.number_of_episodes,
                    rating: rating,
                    poster: TMDB_IMG_BASE + match.poster_path,
                    logo: logo_path,
                    backdrop: TMDB_O_IMG_BASE + match.backdrop_path,
                    cast: JSON.stringify(cast_list),
                    studio:studio
                }
                return resolve(match)
            }
            catch(e){
                console.error('ERROR with', title, year, e.message)
                resolve('skip')
            }
        })
    }
    searchEpisode(id, season, episode){
        return new Promise(async(resolve)=>{
            let data = await this.getJSON(`https://api.themoviedb.org/3/tv/${id}/season/${season}/episode/${episode}?api_key=${TMDB_KEY}&language=en`)
            data = {
                id: data.id,
                season: data.season_number,
                episode: data.episode_number,
                title: data.name,
                date: data.air_date == undefined ? -1 : parseInt(data.air_date.replace(/[^0-9]/g, '')),
                overview: data.overview,  
                vote: data.vote_average,
                still: TMDB_IMG_BASE + data.still_path
            } 
            return resolve(data)
        })
    }
}

async function build(){
    const folders = fs.readdirSync(SHOW_PATH)
    let valid_folders = []

    const api = new TMDB_API()
    const db = new db_manager()
    
    for(let i = 0; i < folders.length; i++){
        let valid = false
        const files =  fs.readdirSync(SHOW_PATH+folders[i])
        for(let i = 0; i < files.length; i++) if(files[i].toLowerCase().includes('.mp4') || files[i].toLowerCase().includes('.m4v')){valid = true; break}
        if(valid) valid_folders.push(folders[i])
    }

    for(let i = 0; i < valid_folders.length; i++){
        try{
            // PARSE SEARCH TERMS
            const title = valid_folders[i].split(/[\[\]]/)[0].trim().replace(/[^A-Za-z0-9]/g, ' ')
            const year  = parseInt(valid_folders[i].split(/[\[\]]/)[1].trim().replace(/[^0-9]/g, ''))

            // UI
            console.log("\x1b[0m", '......')
            console.log("\x1b[33m", `SCANNING: ${title} [${year}] from file "${SHOW_PATH + valid_folders[i]}"`)

            // SEARCH SHOW
            const match = await api.search(title, year)
            if(match == 'skip') continue
            const createSuccess = await db.createTable(match.id)
            if(!createSuccess) throw 'TABLE CREATION FAILED'
            else db.add(match.id, match.title, match.year, match.start_date, match.end_date, match.genres, match.overview, match.vote, match.num_seasons, match.num_episodes, match.rating, match.poster, match.logo, match.backdrop, REL_SHOW_PATH+valid_folders[i], match.cast, match.studio)

            // SEARCH EPISODES
            const episodes = fs.readdirSync(SHOW_PATH + valid_folders[i])
            for(let x = 0; x < episodes.length; x++){

                // LOG PROGRESS
                process.stdout.write('Scanning Episodes - ' + (x+1) + ' / ' + episodes.length)

                // CHECK IF VALID FORMAT
                if(!(episodes[x].toLowerCase().includes('.mp4') || episodes[x].toLowerCase().includes('.m4v')) || episode(episodes[x]).matches.length == 0) continue
                
                // PARSE NAME
                const eParse = episode(episodes[x])

                // REQUEST DATA
                let eData = await api.searchEpisode(match.id, eParse.season, eParse.episode)
                if(eData.id == undefined) continue

                // PARSE EPISODE DURATION
                let duration = await new Promise((resolve)=>{
                    getVideoDurationInSeconds(SHOW_PATH + valid_folders[i] + '/' + episodes[x]).then((dur) => {
                        resolve(dur)
                    })
                })

                // ADD TO DB
                const success = await db.addEpisode(match.id, eData.id, eData.season, eData.episode, eData.title, eData.date, eData.overview, eData.vote, duration, eData.still, REL_SHOW_PATH+valid_folders[i]+'/'+episodes[x])
                if(!success) console.log(`ERROR WITH FILE ${REL_SHOW_PATH+valid_folders[i]+'/'+episodes[x]}`)

                if(x + 1 < episodes.length){
                    process.stdout.clearLine();  // clear current text
                    process.stdout.cursorTo(0);  // move cursor to beginning of line
                }
            }
            console.log()
        }
        catch(e){
            console.error("\x1b[31m", 'ERROR with ' + valid_folders[i] + ' | ' + e.message)
        }
    }
}

const cast = new crew_manager(CAST_DB)
build()
console.log("\x1b[0m",'')