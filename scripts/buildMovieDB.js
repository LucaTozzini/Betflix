const fs = require('fs')
const https = require('https');
const sqlite3 = require('sqlite3').verbose()
const { getVideoDurationInSeconds } = require('get-video-duration');
const { resolve } = require('path');


const TMDB_KEY       = '99c6bddf93662b05e7e8f0a1303cbca5'
const TMDB_IMG_BASE  = 'https://image.tmdb.org/t/p/w500'
const TMDB_O_IMG_BASE= 'https://image.tmdb.org/t/p/original'
const MOVIE_PATH     = '../media/movies/'
const REL_MOVIE_PATH = './media/movies/'
const MEDIA_DB       = '../data/media.db'
const CAST_DB        = '../data/cast.db'
const DIRECTOR_DB    = '../data/director.db'
let GENRE_LIST = []

class db_manager{
    #mediaDB
    constructor(){
        this.#mediaDB = new sqlite3.Database(MEDIA_DB, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};console.log("MediaDB initialized")})
        this.#mediaDB.run('CREATE TABLE movie(id, title, year, date, genres, overview, vote, duration, budget, revenue, content_rating, poster, logo, backdrop, path, type, cast, director, studio)', (err)=>{if(err) return console.error(err.message); else return console.log('DB "list" TABLE created')})
    }
    add(id, title, year, date, genres, overview, vote, duration, budget, revenue, content_rating, poster, logo, backdrop, path, cast, director, studio){
        this.#mediaDB.get(`SELECT id FROM movie WHERE id = ${id}`, (err, row)=>{
            if(err) return console.error(err.message)
            if(row == null){
                this.#mediaDB.run("INSERT INTO movie(id, title, year, date, genres, overview, vote, duration, budget, revenue, content_rating, poster, logo, backdrop, path, type, cast, director, studio) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [id, title, year, date, genres, overview, vote, duration, budget, revenue, content_rating, poster, logo, backdrop, path, 'movie', cast, director, studio], (err)=>{
                    if(err)return console.error(err.message)
                    console.log(`Added ${title} to movie list`)
                })
            }
            else return console.log(`${title} already in database`)
        })
        genres.forEach((item)=>{
            this.#mediaDB.run(`CREATE TABLE ${item} (type, id)`, (err)=>{
                if(!err) console.log(`DB "${item}" TABLE created`)
                try{
                    this.#mediaDB.get(`SELECT id FROM ${item} WHERE id = ${id}`, (err, row)=>{
                        if(err) return console.error(err.message)
                        if(row == null){
                            this.#mediaDB.run(`INSERT INTO ${item} (type, id) VALUES (?,?)`, ['movie',id], (err)=>{
                                if(err)return console.error(err.message)
                                console.log(`Added ${title} to ${item}`)
                            })
                        }
                        else return console.log(`${title} already in ${item}`)
                    })
                }
                catch{
                    return console.log(`ERROR ADDING ${title} TO ${item}.db`)
                }
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
    hasMovie(id, movieID){
        return new Promise((resolve)=>{
            this.#DB.get(`SELECT * FROM '${id}' WHERE id=${movieID} AND type="movie"`, (err, row)=>{
                if(err) console.error(err.message)
                if(row == undefined) return resolve(false)
                return resolve(true)
            })
        })
    }
    addToPerson(id, movieID){
        return new Promise(async (resolve)=>{
            if(!await this.hasMovie(id, movieID)){
                this.#DB.run(`INSERT INTO '${id}'(type, id) VALUES (?,?)`, ['movie', movieID], (err)=>{
                    if (err) console.error('@ line 113 |' + err.message)
                })
            }
            return resolve(true)
        })
    }
}

const cast = new crew_manager(CAST_DB)
const director = new crew_manager(DIRECTOR_DB)


function getJSON(url){
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

async function searchMovie(title, year){
    return new Promise(async (resolve)=>{
        try{
            let url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&language=en&query=${title}`
            let data = await getJSON(url)
            let match = null
            if(data.results.length == 0){
                console.log("\x1b[31m",`NO MATCH FOR ${title}`)
                return resolve(null)
            }
            data.results.forEach((item)=>{
                if(item.release_date != null){
                    if(match == null && year == item.release_date.split('-')[0] && title.toUpperCase().replace(/[^A-Z]/g, '') == item.title.toUpperCase().replace(/[^A-Z]/g, '')){
                        match = item;
                    }
                }
            })
            if(match == null){
                match = data.results[0]
            }
            console.log("\x1b[32m", 'Match Found')

            let genres = []
            for(let i = 0; i < match.genre_ids.length; i++){
                let genre = GENRE_LIST.find(function(value){
                    return value.id == match.genre_ids[i]
                })
                if(genre.name == 'Science Fiction') genre.name = 'Sci_Fi'
                genres.push(genre.name.replace(' ', '_'))
            }
            console.log("\x1b[0m",'Genres Found')

            let logo_path = await getJSON(`https://api.themoviedb.org/3/movie/${match.id}/images?api_key=${TMDB_KEY}&language=en`)
            if(logo_path.logos.length > 0) logo_path = TMDB_IMG_BASE + logo_path.logos[0].file_path
            else logo_path = null

            let backdrop_path = await getJSON(`https://api.themoviedb.org/3/movie/${match.id}/images?api_key=${TMDB_KEY}&language=null`)
            if(backdrop_path.backdrops.length > 0) backdrop_path = TMDB_O_IMG_BASE + backdrop_path.backdrops[0].file_path
            else backdrop_path = null

            let studio = await getJSON(`https://api.themoviedb.org/3/movie/${match.id}?api_key=${TMDB_KEY}`)
            studio = studio.production_companies.length > 0 ? studio.production_companies[0].name : 'Unknown'


            let credits = await getJSON(`https://api.themoviedb.org/3/movie/${match.id}/credits?api_key=${TMDB_KEY}`)
            console.log('Credits found')
            let dir_list = []

            // SCAN FOR DIRECTOR
            for(let i = 0; i < credits.crew.length; i++){
                process.stdout.write('Scanning Director - ' + (i+1) + ' / ' + credits.crew.length)
                if(credits.crew[i].job == 'Director'){
                    const d = credits.crew[i]
                    if(d.profile_path == null) d.profile_path = './img/missing-profile.png'
                    else d.profile_path = TMDB_IMG_BASE + d.profile_path

                    const director_data = await getJSON(`https://api.themoviedb.org/3/person/${d.id}?api_key=${TMDB_KEY}&language=en`)

                    director.add(d.id, d.name, d.gender, d.profile_path, director_data.biography, director_data.birthday, director_data.deathday)
                    await director.createPersonTable(d.id)
                    await director.addToPerson(d.id, match.id)
                    dir_list.push(d.id)
                }
                if(i + 1 < credits.crew.length){
                    process.stdout.clearLine();  // clear current text
                    process.stdout.cursorTo(0);  // move cursor to beginning of line
                }
            }
            console.log()

            let cast_list = []

            // SCAN CAST
            for(let i = 0; i < credits.cast.length; i++){
                
                process.stdout.write('Scanning Cast - ' + (i+1) + ' / ' + credits.cast.length)

                const actor = credits.cast[i]
                if(actor.profile_path == null) actor.profile_path = './img/missing-profile.png'
                else actor.profile_path = TMDB_IMG_BASE + actor.profile_path
                
                const actor_data = await getJSON(`https://api.themoviedb.org/3/person/${actor.id}?api_key=${TMDB_KEY}&language=en`)
                cast.add(actor.id, actor.name, actor.gender, actor.profile_path, actor_data.biography, actor_data.birthday, actor_data.deathday)


                await cast.createPersonTable(actor.id)
                await cast.addToPerson(actor.id, match.id)
                cast_list.push({actor:actor.id, character:actor.character})

                if(i + 1 < credits.cast.length){
                    process.stdout.clearLine();  // clear current text
                    process.stdout.cursorTo(0);  // move cursor to beginning of line
                }
            }
            console.log()
            console.log('Cast set')

            data = await getJSON(`https://api.themoviedb.org/3/movie/${match.id}?api_key=${TMDB_KEY}&append_to_response=releases`)
            let budget = data.budget
            let revenue = data.revenue
    
            // SEARCH RATING
            let rating
            for(let i = 0; i < data.releases.countries.length; i++){
                if(data.releases.countries[i].iso_3166_1 == 'US'){
                    rating = data.releases.countries[i].certification
                    if(rating != ''){
                        break
                    }
                }
            }
            if(rating == '') rating = 'NR'
            console.log('Rating Found')

            // FINALIZE DATA
            match = {
                id:             match.id,
                title:          match.title,
                year:           parseInt(match.release_date.split('-')[0]),
                date:           parseInt(match.release_date.replace(/[^0-9]/g, '')),
                genres:         genres.sort(),
                overview:       match.overview,
                vote:           match.vote_average,
                budget:         budget,
                revenue:        revenue,
                content_rating: rating,
                poster_path:    TMDB_IMG_BASE + match.poster_path,
                logo_path:      logo_path,
                backdrop_path:  backdrop_path,
                cast_list:      JSON.stringify(cast_list),
                director:       JSON.stringify(dir_list),
                studio:         studio
            }
            return resolve(match)
        }
        catch(e){
            console.log("\x1b[31m", `ERROR WITH ${title} - ${e}`)
            return resolve(null)
        }
    })
}

async function getGenreList(){
    GENRE_LIST = await getJSON(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_KEY}&language=en`)
    GENRE_LIST = GENRE_LIST.genres
    return new Promise((r)=>{r()})
}

async function build(){
    const files = fs.readdirSync(MOVIE_PATH)
    const db = new db_manager()
    await getGenreList()
    for(let i = 0; i < files.length; i++){
        // Check if file is video file (mp4 or m4v)
        if(files[i].toLowerCase().includes('.mp4') || files[i].toLowerCase().includes('.m4v')){
            try{
                let title, year = 0
                //get file duration
                let duration = await new Promise((resolve)=>{
                    getVideoDurationInSeconds(MOVIE_PATH + files[i]).then((dur) => {
                        resolve(dur)
                    })
                })
                if(files[i].split('[').length > 1){
                    title = files[i].split('[')[0].replace(/[^A-Za-z0-9]/g, ' ').trim()
                    year = parseInt(files[i].split('[')[1].split(']')[0].replace(/[^0-9]/g,''))
                    
                    console.log("\x1b[0m", '......')
                    console.log("\x1b[33m", `SCANNING: ${title} [${year}] from file "${REL_MOVIE_PATH + files[i]}"`)
                    
                    let data = await searchMovie(title, year)
                    if(data != null){
                        db.add(data.id, data.title, data.year, data.date, data.genres, data.overview, data.vote, duration, data.budget, data.revenue, data.content_rating, data.poster_path, data.logo_path, data.backdrop_path, REL_MOVIE_PATH + files[i], data.cast_list, data.director, data.studio)
                    }
                }
                else{
                    console.log('.......')
                    console.log(`WRONG NAMING FORMAT FOR ${files[i]}. Proper format example: "title [year].mp4"`)
                    console.log('.......')
                }
            }
            catch{
                console.log('.......')
                console.log(`ERROR WITH ${files[i]}`)
                console.log('.......')
            }
        }
    }
}

build()
console.log("\x1b[0m")
