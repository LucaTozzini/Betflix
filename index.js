const fs = require('fs')

const https = require('https');
const { get } = require('http');

const { resolve } = require('path')

const episode = require('episode');

const express = require('express')
const { response } = require('express')
const app = express()

const sqlite3 = require('sqlite3').verbose()
const USER_DATABASES  = './data/users/'
const USER_DATA_PATH  = './data/users.db'
const MEDIA_DATA_PATH = './data/media.db'
const SHOW_DATA_PATH  = './data/media/show.db'
const CAST_DATA_PATH  = './data/cast.db'
const DIRECTOR_DATA_PATH = './data/director.db'

const SECTION_LIMIT = 50
const CONTINUE_LIMIT = 10

const port = 3000
app.use(express.static('public'))
app.use(express.json())

app.listen(port, ()=> {
    console.log(`...`)
    console.log(`Started Server @ port ${port}`)
})

class userDataManager{
    #userDB
    constructor(){
        this.#userDB = new sqlite3.Database(USER_DATA_PATH, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};console.log("userDB initialized")})
        this.#userDB.run('CREATE TABLE list(id, img)', (err)=>{
            if(err) console.error(err.message)
            else console.log('userDB "list" TABLE created')
            console.log(`...`)
            return
        })
    }
    getList(){
        const db = this.#userDB 
        return new Promise((r)=>{
            db.all('SELECT * FROM list', [], (err, rows)=>{
                if (err) return console.error(err.message)
                r(rows)
            })
        })
    }
    getUser(userID){
        const db = this.#userDB 
        return new Promise((resolve)=>{
            db.get(`SELECT * FROM list WHERE id="${userID}" LIMIT 1`, (err, row)=>{
                if (err){
                    console.error('getUser ERROR: ' + err.message)
                    return resolve({'id': -1 })
                }
                else if (row == undefined) return resolve({'id': -1 })
                else return resolve(row)
            })
        })
    }
    addUser(id, img){
        const db = this.#userDB 
        let dup = false
        
        db.all('SELECT id FROM list', [], 
            (err, users)=>{
                if (err) return console.error(err.message)//check for errors
                users.forEach((user)=>{
                    if (user.id == id) { dup = true }
                })
                
                if (dup || id.length < 2){
                    console.error(`Error: Can't add user`, id)
                    return
                }
                //add user to list
                db.run("INSERT INTO list (id, img) VALUES (?,?)", [id, img], (err)=>{
                    if(err)return console.error(err.message)
                    console.log(`Added ${id} to users list`)
                })
                //create a db file for new user
                fs.writeFileSync('data/users/'+id+'.db', '')
                //create tables
                const newUser = new sqlite3.Database(`data/users/${id}.db`, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
                newUser.run(`CREATE TABLE watchlist(type, itemID, date)`, (err)=>{if(err){return console.error(err.message)}})
                newUser.run(`CREATE TABLE continue(type, itemID, episodeID, percent, date)`, (err)=>{if(err){return console.error(err.message)}})
                newUser.run(`CREATE TABLE complete(type, itemID, episodeID, date)`, (err)=>{if(err){return console.error(err.message)}})
            })    
    }
    removeUser(userID){
        try {
            //remove user from db
            this.#userDB.run(`DELETE FROM list WHERE id = '${userID}'`)
            //delete the db file for the user
            fs.unlinkSync('data/users/'+userID+'.db', (err)=>{if (err) return console.error(err.message)})
            //log action
            console.log(`Removed ${userID} from users`)
        }
        catch(error) {console.error(error.message)}
    }
    addToWatchlist(userID, itemType, itemID){
        return new Promise((resolve)=>{
            try{
                const watchlist = new sqlite3.Database(`data/users/${userID}.db`, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
                watchlist.get(`SELECT * FROM watchlist WHERE type='${itemType}' AND itemID=${itemID}`, async (err, rows)=>{
                    if(err) console.error(err.message)
                    const date = await getDate()
                    if(rows == undefined){
                        watchlist.run("INSERT INTO watchlist (type, itemID, date) VALUES (?,?,?)", [itemType, itemID, date], (err)=>{
                            if(err)return console.error(err.message)
                            console.log(`${date} - ${userID} | Added ${itemType} with id:${itemID} to watchlist`)
                            return resolve(true)
                        })
                    }
                    else{
                        console.log(`${date} - ${userID} | Error: ${itemType} with id:${itemID} already in watchlist`)
                        resolve(false)
                    }
                })
            }
            catch{
                console.log(`Error adding ${itemType} with id: ${itemID} to watchlist for ${userID}`)
                return resolve(false)
            }
        })
    }
    removeFromWatchlist(userID, itemType, itemID){
        return new Promise((resolve)=>{
            try{
                const watchlist = new sqlite3.Database(`data/users/${userID}.db`, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
                watchlist.run(`DELETE FROM watchlist WHERE type='${itemType}' AND itemID=${itemID}`, (err)=>{
                    if(err){
                        resolve(false)
                        return console.error(err.message)
                    }
                    console.log(`${userID} | Removed ${itemType} with id:${itemID} from watchlist`)
                    return resolve(true)
                })
            }
            catch{
                return resolve(false)
            }
        })
    }
    isInWatchlist(userID, itemType, itemID){
        return new Promise((resolve)=>{
            const watchlist = new sqlite3.Database(`data/users/${userID}.db`, sqlite3.OPEN_READONLY, (err)=>{if(err){return console.error(err.message)}})
            watchlist.get(`SELECT * FROM watchlist WHERE type='${itemType}' AND itemID=${itemID}`, (err, rows)=>{
                if(err) console.error(err)
                if(rows == undefined) return resolve(false)
                else return resolve(true)
            })
        })
    }
    getWatchlist(userID){
        return new Promise((resolve)=>{
            const user = new sqlite3.Database(`data/users/${userID}.db`, sqlite3.OPEN_READONLY, (err)=>{if(err)return console.error(err.message)})
            user.all('SELECT * FROM watchlist ORDER BY date DESC', [], (err, rows)=>{
                if(err) return console.error(err.message)
                resolve(rows)
            })
        })
    }
    isInContinue(db, type, itemID, episodeID){
        return new Promise((resolve)=>{
            db.get(`SELECT * FROM continue WHERE type="${type}" AND itemID = ${itemID} AND episodeID = ${episodeID} LIMIT 1`, (err, row)=>{
                if (err){console.error('isInContinue ERROR: '+err.message); return resolve('ERROR')}
                if (row != undefined) return resolve(true)
                else return resolve(false)
            })
        })
    }
    isInComplete(db, type, itemID, episodeID){
        return new Promise((resolve)=>{
            try{
                db.get(`SELECT * FROM complete WHERE type="${type}" AND itemID = ${itemID} AND episodeID = ${episodeID} LIMIT 1`, (err, row)=>{
                    if (err){console.error('inComplete ERROR: '+err.message); return resolve('ERROR')}
                    if (row != undefined) return resolve(true)
                    else return resolve(false)
                })
            }
            catch(e){
                console.error(4, 'inComplete CRASH', e.message)
                return resolve('ERROR')
            }
        })
    }
    updateContinue(userID, type, itemID, episodeID, percent){
        return new Promise(async (resolve)=>{
            try{
                if(percent == null) return resolve({success:true})
                const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
                const date = await getDate()
                const isIn = await this.isInContinue(db, type, itemID, episodeID)
                if(isIn == 'ERROR'){return console.error('updateContinue ERROR')} 
                else if(!isIn){
                    db.run(`INSERT INTO continue(type, itemID, episodeID, percent, date) VALUES (?,?,?,?,?)`, [type, itemID, episodeID, percent, date], (err)=>{
                        if(err){console.error(err.message); return resolve({success:false})}
                        return resolve({success:true})
                    })
                }
                else{
                    db.run(`UPDATE continue SET percent = ${percent}, date = ${date} WHERE type = "${type}" AND itemID = ${itemID} AND episodeID = ${episodeID}`, (err)=>{
                        if(err){console.error(err.message); return resolve({success:false})}
                        return resolve({success:true})
                    })
                }
            }
            catch{
                console.log('updateContinue CRASH')
                return resolve({success:false})
            }
        })
    }
    getContinue(userID){
        return new Promise((resolve)=>{
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
            db.all(`SELECT * FROM continue ORDER BY date DESC LIMIT ${CONTINUE_LIMIT}`, [], async (err, rows)=>{
                if(err){console.error(err.message); return resolve([])}
                let items = []
                for(let i = 0; i < rows.length; i++){
                    const item = await mediaManager.search(rows[i].type, rows[i].itemID)
                    const progress = {episodeID:rows[i].episodeID, percent:rows[i].percent}
                    items.push({item:item, progress:progress})
                }
                return resolve(items)
            })
        })
    }  
    getProgress(userID, type, itemID, episodeID){
        return new Promise((resolve)=>{
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
            db.get(`SELECT percent FROM continue WHERE type = "${type}" AND itemID = ${itemID} AND episodeID = ${episodeID} LIMIT 1`, (err, row)=>{
                if (err){console.error(err.message); return resolve({percent:0})}
                else if (row == undefined) return resolve({percent:0})
                else return resolve(row)
            })
        })
    }
    deleteContinue(userID, type, itemID, episodeID){
        return new Promise((resolve)=>{
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{
                if(err){
                    console.error('deleteContinue ERROR',err.message)
                    return resolve({success:false})
                }
            })
            db.get(`DELETE FROM continue WHERE type = "${type}" AND itemID = ${itemID} AND episodeID = ${episodeID}`, (err)=>{
                if (err){
                    console.error('deleteContinue ERROR',err.message)
                    return resolve({success:false})
                }
                else return resolve({success:true})
            })
        })
    }
    setNext(userID, showID, episodeID){
        return new Promise( async (resolve)=>{
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err) {console.error('addComplete ERROR',err.message);return resolve({success:false})}})
            const m = new mediaDataManager(true)
            const next = await m.nextEpisode(showID, episodeID)
            if(next.state == undefined){
                const isIn = await this.isInContinue(db, 'show', showID, next.id)
                if(isIn == 'ERROR') return resolve({success:false})
                const date = await getDate()
                if(isIn){
                    db.run(`UPDATE continue SET date = ${date} WHERE type = "show" AND itemID = ${showID} AND episodeID = ${next.id}`, (err)=>{
                        if(err){
                            console.error('setNext ERROR', err.message)
                            return resolve({success:false})
                        }
                        return resolve({success:true})
                    })
                }
                else{
                    let success = await this.updateContinue(userID, 'show', showID, next.id, 0)
                    return resolve({success:success.success})
                }
            }
            else if(next.state == 'end') return resolve({success:true, message:'end of show'})
            return resolve({success:false})
        })
    }
    addComplete(userID, type, itemID, episodeID){
        return new Promise( async (resolve)=>{
            
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err) {console.error('addComplete ERROR',err.message);return resolve({success:false})}})

            const isIn = await this.isInComplete(db, type, itemID, episodeID)
            
            if(isIn == 'ERROR') return resolve({success:false})
            else if(isIn) return resolve({success:true})
            
            const date = await getDate()
            db.run(`INSERT INTO complete(type, itemID, episodeID, date) VALUES (?,?,?,?)`, [type, itemID, episodeID, date], (err)=>{
                if(err){
                    console.error('addComplete ERROR',err.message)
                    return resolve({success:false}) 
                }
                else return resolve({success:true})
            })
        })
    }
    currentEpisode(userID, itemID){
        return new Promise((resolve)=>{
            const db = new sqlite3.Database(USER_DATABASES + userID + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)}})
            const m = new mediaDataManager(true)
    
            db.get(`SELECT * FROM continue WHERE type="show" AND itemID=${itemID} ORDER BY date DESC`, async (err, row)=>{
                if(err){console.error('currentEpisode ERROR', err.message); return resolve({})}
                else if(row != undefined){const data = await m.getEpisode(row.itemID, row.episodeID);return resolve(data)}
                else{
                    db.all(`SELECT * FROM complete WHERE type="show" AND itemID=${itemID}`, [], async (err, rows)=>{
                        if(err){console.error('currentEpisode ERROR', err.message); return resolve({})}
                        else if(rows.length >0){
                            let newest = await m.getEpisode(rows[0].itemID, rows[0].episodeID)
                            for(let i = 1; i < rows.length; i++){
                                const cur = await m.getEpisode(rows[i].itemID, rows[i].episodeID)
                                if(cur.season >= newest.season && cur.episode > newest.episode) newest = cur
                            }
                            let episode = await m.nextEpisode(itemID, newest.id)
                            if('state' in episode){
                                episode = await m.firstEpisode(itemID)
                                episode = await m.getEpisode(itemID, episode.id)    
                            }
                            return resolve(episode)
                        }
                        else{
                            let cur = await m.firstEpisode(itemID)
                            cur = await m.getEpisode(itemID, cur.id)
                            return resolve(cur)
                        }

                    })
                }
            })
        })
    }
}
class mediaDataManager{
    #mediaDB
    #showDB
    #castDB
    #directorDB
    constructor(silent){
        this.#mediaDB     = new sqlite3.Database(MEDIA_DATA_PATH,     sqlite3.OPEN_READONLY, (err)=>{if(err){return console.error(err.message)};if(!silent)console.log("mediaDB initialized")})
        this.#showDB      = new sqlite3.Database(SHOW_DATA_PATH,      sqlite3.OPEN_READONLY, (err)=>{if(err){return console.error(err.message)};if(!silent)console.log("showDB  initialized")})
        this.#castDB      = new sqlite3.Database(CAST_DATA_PATH,      sqlite3.OPEN_READONLY, (err)=>{if(err){return console.error(err.message)};if(!silent)console.log("castDB  initialized")})
        this.#directorDB  = new sqlite3.Database(DIRECTOR_DATA_PATH,  sqlite3.OPEN_READONLY, (err)=>{if(err){return console.error(err.message)};if(!silent)console.log("directorDB  initialized")})
    }
    search(type, id){
        return new Promise((resolve)=>{
            if(type != 'movie' && type != 'show') return resolve({})  
            this.#mediaDB.get(`SELECT * FROM "${type}" WHERE id = ${id} LIMIT 1`, (err, row)=>{
                if(err){
                    console.error('SEARCH ERROR: ' + err.message)
                    return resolve({})
                } 
                return resolve(row)
            })
        })
    }
    searchTitle(title){
        return new Promise( async (resolve)=>{
            if(title.replace(/[^A-Za-z0-9]/g, '').length == 0) return resolve([])
            const movies = await new Promise((movies)=>{
                this.#mediaDB.all(`SELECT type, id, title, year, poster FROM movie WHERE title LIKE '%${title}%' OR title LIKE '${title}%' OR title LIKE '${title}'`, [], (err, rows)=>{
                    if(err){console.error(err.message); movies([])}
                    else if(rows == undefined) movies([])
                    else{
                        movies(rows)
                    }
                })
            })

            const shows = await new Promise((shows)=>{
                this.#mediaDB.all(`SELECT type, id, title, year, poster FROM show WHERE title LIKE '%${title}%' OR title LIKE '${title}%' OR title LIKE '${title}'`, [], (err, rows)=>{
                    if(err){console.error(err.message); shows([])}
                    else if(rows == undefined) shows([])
                    else{
                        shows(rows)
                    }
                })
            })

            const items = movies.concat(shows)

            items.sort((a,b)=>{
                return Math.abs(a.title.length - title.length) - Math.abs(b.title.length - title.length)
            })

            return resolve(items)
        })
    }
    getSeason(showID, season){
        return new Promise((resolve)=>{
            this.#showDB.all(`SELECT * FROM "${showID}" WHERE season = ${season} ORDER BY episode ASC`, (err, rows)=>{
                if(err){
                    console.error("getSeason ERROR: "+err.message)
                    resolve({})
                }
                else if (rows == undefined) return resolve({})
                else return resolve(rows)
            })
        })
    }
    seasonList(showID){
        return new Promise((resolve)=>{
            this.#showDB.all(`SELECT DISTINCT season FROM "${showID}"`, [], (err, rows)=>{
                if (err){
                    console.error('seasonList ERROR: ' + err.message)
                    return resolve([])
                }
                else if (rows.length > 0){
                    let list = []
                    for(let i = 0; i < rows.length; i++){
                        list.push(rows[i].season)
                    }
                    return resolve(list.sort((a,b)=>{return a-b}))
                }
                else return resolve([])
            })
        })
    }
    getEpisode(showID, episodeID){
        return new Promise((resolve)=>{
            this.#showDB.get(`SELECT * FROM "${showID}" WHERE id=${episodeID}`, (err, row)=>{
                if(err){
                    console.error('getEpisode ERROR: ' + err.message)
                    return resolve({})
                }
                else if(row == undefined) return resolve({})
                else return resolve(row)
            })
        })
    }
    firstEpisode(id){
        return new Promise(async (resolve)=>{
            let season = await this.firstSeason(id)
            if(!"season" in season) return resolve({})
            else season = season.season
            this.#showDB.get(`SELECT id FROM "${id}" WHERE season=${season} ORDER BY episode ASC LIMIT 1`, (err, row)=>{
                if(err){
                    console.error('firstEpisode ERROR: ' + err.message)
                    return resolve({})
                }
                if(row == undefined) return resolve({})
                else return resolve(row)
            })
        })
    }
    nextEpisode(showID, episodeID){
        return new Promise( async (resolve)=>{
            const cur = await this.getEpisode(showID, episodeID)
            this.#showDB.all(`SELECT * FROM "${showID}" WHERE season >= ${cur.season} AND id != ${cur.id} ORDER BY season ASC, episode ASC`, [], (err, rows)=>{
                if(err){console.error('nextEpisode ERROR', err.message); return resolve({state:'end'})}
                else if(rows.length == 0) return resolve({state:'end'})
                else{
                    for(let i = 0; i < rows.length; i++){
                        if(rows[i].season > cur.season || (rows[i].season == cur.season && rows[i].episode > cur.episode)) return resolve(rows[i])
                    }
                    return resolve({state:'end'})
                }
            })
        })
    }
    firstSeason(id){
        return new Promise((resolve)=>{
            this.#showDB.get(`SELECT season FROM "${id}" ORDER BY season ASC LIMIT 1`, (err, row)=>{
                if(err){
                    console.error('firstSeason ERROR: ' + err.message)
                    return resolve({})
                }
                if(row == undefined) return resolve({})
                else return resolve(row)
            })
        })
    }
    getTitle(type, id){
        return new Promise((resolve)=>{
            this.#mediaDB.get(`SELECT "title" FROM "${type}" WHERE id = ${id} LIMIT 1`, (err, row)=>{
                if(err){
                    console.error('getTitle ERROR: '+err.message)
                    return resolve({})
                }
                else if(row == undefined) return resolve({})
                else return resolve(row)
            })
        })
    }
    getGenre(genre){
        return new Promise((resolve)=>{
            this.#mediaDB.all(`SELECT * FROM ${genre} ORDER BY random() LIMIT ${SECTION_LIMIT}`, async (err, rows)=>{
                if(err){
                    console.error('getGenre ERROR: '+err.message)
                    return resolve([])
                }
                let items = []
                for(let i = 0; i < rows.length; i++){
                    items.push(await this.search(rows[i].type, rows[i].id))
                }
                return resolve(items)
            })
        })
    }
    getMovieRatingDescription(rating){
        return new Promise((resolve)=>{
            let title, description
            if(rating == 'G'){
                title = 'General Audiences'
                description = 'All ages admitted. Nothing that would offend parents for viewing by children.'
            }
            else if(rating == 'PG'){
                title = 'Parental Guidance Suggested'
                description = 'Some material may not be suitable for children.'
            }
            else if(rating == 'PG-13'){
                title = 'Parents Strongly Cautioned'
                description = 'Some material may be inappropriate for children under 13.'
            }
            else if(rating == 'R'){
                title = 'Restricted'
                description = 'Under 17 requires accompanying parent or adult guardian. Contains some adult material.'
            }
            else if(rating == 'NC-17'){
                title = 'Adults Only'
                description = 'No One 17 and Under Admitted. Clearly adult. Children are not admitted.'
            }
            else if(rating == 'NR'){
                title = 'Not Rated'
                description = 'The content of this film has not been evaluated'
            }
            else{
                return resolve({})
            }
            resolve({title: title, description: description})
        })
    }
    getShowRatingDescription(rating){
        return new Promise((resolve)=>{
            let title, description
            if(rating == 'TV-Y'){
                title = 'All Children'
                description = 'This program is designed to be appropriate for all children'
            }
            else if(rating == 'TV-Y7'){
                title = 'Directed To Older Children'
                description = 'This program is designed for children age 7 and above.'
            }
            else if(rating == 'TV-G'){
                title = 'General Audience'
                description = 'Most parents will find this program suitable for all ages.'
            }
            else if(rating == 'TV-PG'){
                title = 'Parental Guidance Suggested'
                description = 'This program contains material that parents may find unsuitable for younger children.'
            }
            else if(rating == 'TV-14'){
                title = 'Parents Strongly Cautioned'
                description = 'This program contains material that most parents would find unsuitable for children under 14 years of age.'
            }
            else if(rating == 'TV-MA'){
                title = 'Mature Audience Only'
                description = 'This program is designed to be viewed by adults. May be unsuitable for children under 17.'
            }
            else{
                return resolve({})
            }
            resolve({title: title, description: description})
        })
    }
    getActor(actorID){
        return new Promise((resolve)=>{
            this.#castDB.get(`SELECT * FROM list WHERE id=${actorID}`, (err, row)=>{
                if(err) console.error(err.message)
                return resolve(row)
            })
        })
    }
    getCast(type, id){
        return new Promise((resolve)=>{
            if(type != 'movie' && type != 'show') return resolve([])
            this.#mediaDB.get(`SELECT "cast" FROM ${type} WHERE id=${id} LIMIT 1`, async (err, row)=>{  
                if(err || row == undefined) return resolve([])
                else{
                    let cast = JSON.parse(row.cast)
                    for(let i = 0; i < cast.length; i++){
                        cast[i].actor = await this.getActor(cast[i].actor)
                    }
                    return resolve(cast)
                }
            })
        })
    }
    getDirector(dirID){
        return new Promise((resolve)=>{
            this.#directorDB.get(`SELECT * FROM list WHERE id=${dirID} LIMIT 1`, (err, row)=>{
                if (err || row == undefined) return resolve({})
                else{
                    return resolve(row)
                }
            })
        })
    }
    getMovieDirectors(id){
        return new Promise(async (resolve)=>{
            this.#mediaDB.get(`SELECT "director" FROM movie WHERE id=${id} LIMIT 1`, async (err, row)=>{
                if(err || row == undefined) return resolve([])
                else{
                    let director = JSON.parse(row.director)
                    for(let i = 0; i < director.length; i++){
                        director[i] = await this.getDirector(director[i])
                    }
                    return resolve(director)
                }
            })
        })
    }
    getCatalog(type, id){
        return new Promise(resolve=>{
            const db = type == 'director' ? this.#directorDB : this.#castDB
            db.all(`SELECT * FROM "${id}"`, [], (err, rows)=>{
                if(err){
                    console.error('getCatalog ERROR:', err.message)
                    return resolve([])
                }
                return resolve(rows)
            })
        })
    }
}
class databaseManager{
    #mediaDB
    #TMDB_KEY = '99c6bddf93662b05e7e8f0a1303cbca5'
    #IMG_BASE = 'https://image.tmdb.org/t/p/w500/'
    #IMG_BASE_O = 'https://image.tmdb.org/t/p/original/'

    constructor(silent){
        this.#mediaDB = new sqlite3.Database(MEDIA_DATA_PATH, sqlite3.OPEN_READWRITE, (err)=>{if(err){return console.error(err.message)};if(!silent)console.log("mediaDB initialized")})
    }
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
    getImages(type, itemID){
        return new Promise( async (resolve)=>{
            const data = type == 'movie' ? await this.getJSON(`https://api.themoviedb.org/3/movie/${itemID}/images?api_key=${this.#TMDB_KEY}`) : await this.getJSON(`https://api.themoviedb.org/3/tv/${itemID}/images?api_key=${this.#TMDB_KEY}`)
            return resolve(data)
        })
    }
    getPosters(type, itemID){
        return new Promise( async (resolve)=>{
            let data = await this.getImages(type, itemID)
            data = data.posters

            let posters = []

            data.forEach((item)=>{if(item.iso_639_1 == 'en') posters.push(this.#IMG_BASE + item.file_path)})

            return resolve(posters)
        })
    }
    getBackdrops(type, itemID){
        return new Promise( async (resolve)=>{
            let data = await this.getImages(type, itemID)
            data = data.backdrops

            let backdrops = []

            data.forEach((item)=>{if(item.iso_639_1 == null) backdrops.push(this.#IMG_BASE_O + item.file_path)})

            return resolve(backdrops)
        })
    }
    getLogos(type, itemID){
        return new Promise( async (resolve)=>{
            let data = await this.getImages(type, itemID)
            data = data.logos

            let logos = []

            data.forEach((item)=>{if(item.iso_639_1 == 'en') logos.push(this.#IMG_BASE + item.file_path)})

            return resolve(logos)
        })
    }

    updatePoster(type, itemID, newPoster){
        return new Promise((resolve)=>{
            this.#mediaDB.run(`UPDATE ${type} SET poster = "${newPoster}" WHERE id = ${itemID}`, (err)=>{
                if(err) {console.error('updatePoster ERRROR', err.message); return resolve(false)}
                else{
                    console.log('updated poster for', itemID)
                    return resolve(true)
                }
            })
        })
    }
    updateBackdrop(type, itemID, newBackdrop){
        return new Promise((resolve)=>{
            this.#mediaDB.run(`UPDATE ${type} SET backdrop = "${newBackdrop}" WHERE id = ${itemID}`, (err)=>{
                if(err) {console.error('updateBackdrop ERRROR', err.message); return resolve(false)}
                else{
                    console.log('updated backdrop for', itemID)
                    return resolve(true)
                }
            })
        })
    }
    updateLogo(type, itemID, newLogo){
        return new Promise((resolve)=>{
            this.#mediaDB.run(`UPDATE ${type} SET logo = "${newLogo}" WHERE id = ${itemID}`, (err)=>{
                if(err) {console.error('updateLogo ERRROR', err.message); return resolve(false)}
                else{
                    console.log('updated logo for', itemID)
                    return resolve(true)
                }
            })
        })
    }
} 
const usersManager = new userDataManager()
const mediaManager  = new mediaDataManager(false)
const database = new databaseManager(false)

app.post('/userAPI/:action', async (request, response)=>{
    const action = request.params.action
    let data = {}

    if (action == 'logIn Alert'){
        console.log(`${await getDate()} - ${request.body.id} logged in on ${request.body.device}`)
    }
    else if (action == 'userList'){
        data = await usersManager.getList()
    }
    else if (action == 'getUser'){
        data = await usersManager.getUser(request.body.id)
    }
    else if (action == 'addUser'){
        usersManager.addUser(request.body.userName, request.body.userImg)
    }
    else if (action == 'removeUser'){
        usersManager.removeUser(request.body.id);
    }
    else if (action == 'getWatchlist'){
        data = await usersManager.getWatchlist(request.body.id)
    }
    else if (action == 'addToWatchlist'){
        data = await usersManager.addToWatchlist(request.body.id, request.body.itemType, request.body.itemID)
    }
    else if (action == 'removeFromWatchlist'){
        data = await usersManager.removeFromWatchlist(request.body.id, request.body.itemType, request.body.itemID)
    }
    else if (action == 'isInWatchlist'){
        data = await usersManager.isInWatchlist(request.body.id, request.body.itemType, request.body.itemID)
    }
    else if (action == 'isInComplete'){
        const db = new sqlite3.Database(USER_DATABASES + request.body.id + '.db', sqlite3.OPEN_READWRITE, (err)=>{if(err) {console.error('addComplete ERROR',err.message);return resolve({success:false})}})
        data = await usersManager.isInComplete(db, request.body.itemType, request.body.itemID, request.body.episodeID)
    }
    else if (action == 'updateContinue'){
        data = await usersManager.updateContinue(request.body.id, request.body.itemType, request.body.itemID, request.body.episodeID, request.body.percent)
    }
    else if (action == 'getContinue'){
        data = await usersManager.getContinue(request.body.id)
    }
    else if (action == 'getProgress'){
        data = await usersManager.getProgress(request.body.id, request.body.itemType, request.body.itemID, request.body.episodeID)
    }
    else if (action == 'deleteContinue'){
        data = await usersManager.deleteContinue(request.body.id, request.body.itemType, request.body.itemID, request.body.episodeID)
    }
    else if (action == 'currentEpisode'){
        data = await usersManager.currentEpisode(request.body.id, request.body.itemID)
    }
    else if (action == 'addComplete'){
        data = await usersManager.addComplete(request.body.id, request.body.itemType, request.body.itemID, request.body.episodeID)
    }
    else if (action == 'setNext'){
        data = await usersManager.setNext(request.body.id, request.body.itemID, request.body.episodeID)
    }
    else {
        data = {status:'Unrecognized Action'}
    }
    response.send(data)
})
app.post('/mediaAPI/:action', async (request, response)=>{
    
    const action = request.params.action
    const type = request.body.type
    const id = request.body.id

    let data = {}

    if(action == 'search'){
        data = await mediaManager.search(type, id)
    } 
    else if (action == 'getTitle'){
        data = await mediaManager.getTitle(type, id)
    }
    else if(action == 'getGenre'){
        data = await mediaManager.getGenre(request.body.genre)
    }
    else if (action == 'getCast'){
        data = await mediaManager.getCast(type, id)
    }
    else if (action == 'getMovieDirectors'){
        data = await mediaManager.getMovieDirectors(id)
    }
    else if (action == 'getSeason'){
        data = await mediaManager.getSeason(id, request.body.season)
    }
    else if (action == 'firstEpisode'){
        data = await mediaManager.firstEpisode(id)
    }
    else if (action == 'firstSeason'){
        data = await mediaManager.firstSeason(id)
    }
    else if (action == 'getEpisode'){
        data = await mediaManager.getEpisode(id, request.body.episodeID)
    }
    else if (action == 'nextEpisode'){
        data = await mediaManager.nextEpisode(id, request.body.episodeID)
    }
    else if (action == 'getRatingDescription'){
        data = type == 'show' ? await mediaManager.getShowRatingDescription(request.body.rating) : await mediaManager.getMovieRatingDescription(request.body.rating)
    }
    else if (action == 'seasonList'){
        data = await mediaManager.seasonList(id)
    }
    else if (action == 'searchTitle'){
        data = await mediaManager.searchTitle(request.body.title)
    }
    else if (action == 'getPerson'){
        data = request.body.type == 'director' ? await mediaManager.getDirector(id) : await mediaManager.getActor(id)  
    }
    else if (action == 'getCatalog'){
        data = await mediaManager.getCatalog(request.body.type, id)
    }
    else {
        data = {status:'Unrecognized Action'}
    }
    response.send(data)
})
app.post('/databaseAPI/:action', async (request, response)=>{
    const action = request.params.action
    let data = {}
    
    if (action == 'getPosters'){
        data = await database.getPosters(request.body.type, request.body.id)
    }
    else if (action == 'updatePoster'){
        data = await database.updatePoster(request.body.type, request.body.id, request.body.poster)
    }
    else if (action == 'getBackdrops'){
        data = await database.getBackdrops(request.body.type, request.body.id)
    }
    else if (action == 'updateBackdrop'){
        data = await database.updateBackdrop(request.body.type, request.body.id, request.body.backdrop)
    }
    else if (action == 'getLogos'){
        data = await database.getLogos(request.body.type, request.body.id)
    }
    else if (action == 'updateLogo'){
        data = await database.updateLogo(request.body.type, request.body.id, request.body.logo)
    }
    else{
        data = {status:'unrecognized action'}
    }
    response.send(data)
})

app.get('/stream', async (request, response)=>{
    try{
        const type = request.query.type
        const id = request.query.id
        const episode = request.query.episode

        const data = type == 'show' ? await mediaManager.getEpisode(id, episode) : await mediaManager.search(type, request.query.id)
        
        const range = request.headers.range;
        if (!range) {
            response.status(400).send("Requires Range header");
        }
        
        const videoPath = data.path
        const videoSize = fs.statSync(videoPath).size;
    
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const NUM_CHUNKS = 10 //how many chunks to send
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + (CHUNK_SIZE * NUM_CHUNKS), videoSize - 1) //subtract 1 because start at 0
        const contentLength = end - start + 1
    
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        }
    
        response.writeHead(206, headers)
        const videoStream = fs.createReadStream(videoPath, { start, end })
        videoStream.pipe(response)
    }
    catch(e){
        console.error(e.message)
        response.status(400).send("Something went wrong")
    }
})

function getDate(){
    return new Promise((resolve)=>{
        const date = new Date()
        const year = date.getFullYear()
        const month =  ("0" + (date.getMonth()+1)).slice(-2)
        const day =    ("0" + (date.getDate()   )).slice(-2)
        const hour =   ("0" + (date.getHours()  )).slice(-2)
        const minute = ("0" + (date.getMinutes())).slice(-2)
        const second = ("0" + (date.getSeconds())).slice(-2)
        return resolve(parseInt(year+month+day+hour+minute+second))
    })
}


// T3ST
function startTest(){
    setTimeout(async()=>{
        // STARTUP TESTS GO HERE
    }, 2000)
}
startTest()