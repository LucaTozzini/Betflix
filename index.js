import https from 'https'
import get from 'http'
import resolve from 'path'
import episode from 'episode'


import fs from 'fs'
import ejs from 'ejs'
import uniqid from 'uniqid'
import express from 'express'
import sqlite3 from 'sqlite3'
import cookieParser from 'cookie-parser'

const app = express()

const USER_DATABASES  = './data/users/'
const USER_DATA_PATH  = './data/users.db'
const MEDIA_DATA_PATH = './data/media.db'
const SHOW_DATA_PATH  = './data/media/show.db'
const CAST_DATA_PATH  = './data/cast.db'
const DIRECTOR_DATA_PATH = './data/director.db'

const USER_PROFILE_IMG_PATH = '/img/profilePictures/'

const SECTION_LIMIT = 50
const CONTINUE_LIMIT = 10

const PORT = 80
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs');

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

app.post('/user/log/in', 
    userIdFromBody,
    authUser,
    async (req, res) => {
        try{
            res.cookie('userId', res.locals.userData.id, { maxAge: 100000000 })
            res.status(200).send()
        }

        catch{
            res.status(500).send()
        }
    }
)

app.get('/user/log/out', async (req, res) => {
    try{
        res.cookie('userId', null, { maxAge: 1 });
        res.status(200).send()
    }
    catch{
        res.status(500).send()
    }
})

app.get('/user/create', (req, res) => {
    try{
        let images = fs.readdirSync('public'+USER_PROFILE_IMG_PATH)
        images = images.map(image => USER_PROFILE_IMG_PATH + image)
        res.render('create-user', {images})
    }
    catch{
        res.status(500).send()
    }
})

app.get('/user', async (req, res) => {
    try{
        // Retrieve User List From Database
        const users = await getUsers()

        // If An Error Occured Retrieving Users
        // Throw Error
        if(users.status == 500){
            throw new Error()
        }

        // Render Page
        res.render('select-user', {data: users.data}) 
    }

    // If An Error Occurs
    // Respond With Internal Server Error (500)
    catch{
        resolve.status(500).send()
    }
})

app.post('/user', async (req, res) => {
    try{
        // Format POST Body
        const name = req.body.name.toString().trim()
        const image = req.body.image.toString()
        const child = Boolean(req.body.child)

        // If The Given Name Is Empty
        // Respond With Bad Request (400)
        if(name.length == 0){
            return res.status(400).json({error: 'Invalid Name'})
        }

        // Create User
        const user = await createUser(name, image, child)

        // If An Error Occurs Creating User
        // Throw Error
        if(user.status == 500){
            throw new Error()
        }

        // If User Is Created Successfully
        // Respond With Created (201) And Redirect To Select User Page
        res.status(201).redirect('/user')
    }

    // If An Error Occurs
    // Respond With Internal Server Error (500)
    catch{
        res.status(500).send()
    }
})

app.get('/home', 
    userIdFromCookie, 
    authUser, 
    async (req, res) => {
        try{
            // Array Of All Genres In Database
            const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War']

            // Get Data For Each Genre
            let media = {}
            for(const genre of genres){
                media[genre] = await getGenre(genre, 0)

                // If An Error Occurs Retrieving Data
                // Throw Error
                if(media[genre].status == 500){
                    throw new Error()
                }
            }

            res.render('home', {user: res.locals.userData, media})
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch{
            res.status(500).send()
        }
    }
)

app.get('/home/movies', 
    userIdFromCookie, 
    authUser, 
    async (req, res) => {
        try{
            // Array Of All Genres In Database
            const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War']

            // Get Data For Each Genre
            let media = {}
            for(const genre of genres){
                media[genre] = await getGenre(genre, 1)

                // If An Error Occurs Retrieving Data
                // Throw Error
                if(media[genre].status == 500){
                    throw new Error()
                }
            }

            res.render('home', {user: res.locals.userData, media})
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch{
            res.status(500).send()
        }
    }
)

app.get('/home/shows', 
    userIdFromCookie, 
    authUser, 
    async (req, res) => {
        try{
            // Array Of All Genres In Database
            const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War']

            // Get Data For Each Genre
            let media = {}
            for(const genre of genres){
                media[genre] = await getGenre(genre, 2)

                // If An Error Occurs Retrieving Data
                // Throw Error
                if(media[genre].status == 500){
                    throw new Error()
                }
            }

            res.render('home', {user: res.locals.userData, media})
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch{
            res.status(500).send()
        }
    }
)

app.get('/search',
    userIdFromCookie,
    authUser,
    async (req, res) => {
        try{
            const x = await searchMedia('Batman')
            res.render('search', {user: res.locals.userData})
        }
        catch{
            res.status(500)
        }
    }
)

app.post('/search', async (req, res) => {
    try{
        const value = req.body.value

        if(value.length == 0){
            return res.json({html: ``})
        }

        const results = await searchMedia(value)

        if(results.status == 500){
            throw new Error()
        }

        let html = ''
        for(const item of results.data){
            html += `
            <a class="media-item" data-id="${item.id}" data-type="${item.type}">
                <div class="media-poster" style="background-image: url('${item.poster}')">
                    <div class="media-overlay">
                        <div class="media-overlay-button watchlist-add"></div>
                        <div class="media-overlay-button play"></div>
                    </div>
                </div>
                <div class="media-title">${item.title}</div>
                <div class="media-year">${item.year}</div>
            </a>
            `
        }

        res.json({html})
    }
    catch(e){
        console.error(e.message)
        res.status(500).send()
    }
})

app.get('/movie/:movieId', 
    userIdFromCookie,
    authUser,
    async (req, res) => {
        try{
            const id = req.params.movieId
            const movie = await searchMovie(id)
            
            if(movie.status == 404){
                return res.status(404).send()
            }
            else if(movie.status == 500){
                throw new Error()
            }

            const castJson = await JSON.parse(movie.data.cast)
            const cast = []
            for(const a of castJson){
                const search = await searchActor(a.actor)
                if(search.status == 500){
                    throw new Error()
                } 
                else if(search.status == 404){
                    continue
                }

                const actor = {
                    data: search.data, 
                    role: a.character
                }
                
                cast.push(actor)
            }

            movie.data.cast = cast

            res.render('media-page', {user: res.locals.userData, data: movie.data})
        }
        catch(e){
            console.error(e.message)
            res.status(500).send()
        }
    }
)

app.get('/show/:showId', 
    userIdFromCookie,
    authUser,
    showIdFromParam,
    getUserSeason,
    async (req, res) => {
        try{
            res.redirect(`/show/${res.locals.showId}/${res.locals.userSeason}`)
        }
        catch{
            res.status(500).send()
        }
    }
)

app.get('/show/:showId/:season', 
    userIdFromCookie,
    authUser,
    showIdFromParam,
    async (req, res) => {
        try{
            const season = parseInt(req.params.season)

            // Get Show Data From Database
            const show = await searchShow(res.locals.showId)

            // Get Season Data From Database
            const episodes = await getSeason(res.locals.showId, season)
            
            // If Show Or Season Is Not In Database
            // Respond With Not Found (404)
            if(show.status == 404 || episodes.status == 404){
                return res.status(404).send()
            }

            const allSeasons = await availableSeasons(res.locals.showId)

            // If An Error Occurs Retrieving Data
            // Throw Error
            if(show.status == 500 || episodes.status == 500 || allSeasons.status == 500){
                throw new Error()
            }

            // Parse Show Cast
            const castJson = await JSON.parse(show.data.cast)

            // Get Actor Info
            const cast = []
            for(const a of castJson){
                const search = await searchActor(a.actor)
                if(search.status == 500){
                    throw new Error()
                } 
                else if(search.status == 404){
                    continue
                }

                const actor = {
                    data: search.data, 
                    role: a.character
                }
                
                cast.push(actor)
            }

            show.data.cast = cast

            // Render Media Page
            res.render('media-page', {user: res.locals.userData, data: show.data, episodes: episodes.data, season, allSeasons: allSeasons.data})
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch(e){
            console.error(e.message)
            res.status(500).send()
        }
    }
)

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

// Start Server
app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`)
})

// Middleware
function authUser(req, res, next){
    users.get(`SELECT * FROM list WHERE id = "${res.locals.userId}"`, (err, row) => {
        // If An Error Occurs
        // Resolve With Internal Server Error (500) 
        if(err){
            console.error(err.message)
            return res.status(500).send()
        }

        // If User Does Not Exist
        // Resolve With Bad Request (400)
        else if(row == undefined){
            return res.status(400).redirect('/user')
        }

        // If User Is Found
        // Go To Next Function
        else{
            res.locals.userData = row
            res.locals.userAuth = true
            next()
        }
    })
}

function userIdFromCookie(req, res, next){
    res.locals.userId = req.cookies.userId
    next()
}

function userIdFromBody(req, res, next){
    try{
        res.locals.userId = req.body.userId
        next()
    }
    catch{
        res.status(500).send()
    }
}

function showIdFromParam(req, res, next){
    try{
        res.locals.showId = req.params.showId
        next()
    }
    catch{
        res.status(500).send()
    }
}

function getUserSeason(req, res, next){
    try{
        const db = new sqlite3.Database(USER_DATABASES+res.locals.userId+'.db', sqlite3.OPEN_READONLY, (err) => {
            db.get(`SELECT season FROM continue WHERE type = "show" AND id = ${res.locals.showId} ORDER BY time_stamp DESC`, async (err, row) => {
                if(err){
                    return res.status(500).send()
                }
                else if(row != undefined){
                    res.locals.userSeason = row.season
                }
                else{
                    const all = await availableSeasons(res.locals.showId)
                    
                    if(all.status == 500){
                        return res.status(500).send()
                    }

                    res.locals.userSeason = all.data[0].season
                    next()
                }
            })
        })
    }
    catch{
        res.status(500).send()
    }
}

// Helper Functions
function newUserDatabase(userId){
    return new Promise(resolve => {
        try{
            fs.openSync(USER_DATABASES+userId+'.db', 'w')
                
            const userDB = new sqlite3.Database(USER_DATABASES+userId+'.db', sqlite3.OPEN_READWRITE, (err) => {
                if(err){
                    console.error(err.message)
                    resolve({status: 500})
                }
                else{
                    userDB.run(`CREATE TABLE watchlist(type, id, time_stamp)`, (err) => {
                        if(err){
                            console.error(err.message)
                            resolve({status: 500})
                        }
                        userDB.run(`CREATE TABLE continue(type, id, time, season, episode, time_stamp)`, (err) => {
                            if(err){
                                console.error(err.message)
                                resolve({status: 500})
                            }
                            else{
                                resolve({status: 201})
                            }   
                        })
                    })
                }
            })
        }
        catch{
            users.run(`DELETE FROM list WHERE id = $id`, {$id: userId}, (err) => {
                if(err){
                    console.error(err.message)
                }
            })
            resolve({status: 500})
        }
    })
}

function createUser($name, $image, $child){
    return new Promise(async resolve => {
        try{
            // Create Unique Id For User
            const $id = uniqid('user_')

            // Insert User Into Users List
            const list = await new Promise(resolve => {
                users.run(`INSERT INTO list VALUES ($id, $name, $image, $child)`, {$id, $name, $image, $child}, (err) => {
                    // If An Error Occurs
                    // Resolve With Internal Server Error (500)
                    if(err){
                        console.error(err.message)
                        resolve({status: 500})
                    }
                    // If Insertion Is Successful
                    // Resolve With Created (201)
                    else{
                        resolve({status: 201})
                    }
                })
            })

            if(list.status == 500){
                throw new Error()
            }

            // Create User's Database
            const userDB = await newUserDatabase($id)

            if(userDB.status == 500){
                throw new Error()
            }
            resolve({status: 201})
        }

        // If An Error Occurs
        // Resolve With Internal Server Error (500) 
        catch(e){
            console.error(e.message)
            resolve({status: 500})
        }
    })
}

function getUsers(){
    return new Promise(resolve => {
        users.all(`SELECT * FROM list`, [], (err, rows) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else{
                resolve({status: 200, data: rows})
            }
        })
    })
}

function getGenre(genre, type){
    return new Promise(resolve => {
        let where = ''
        if(type == 1){
            where = 'WHERE type = "movie"'
        }
        else if(type == 2){
            where = 'WHERE type = "show"'
        }
        
        media.all(`
            SELECT *
            FROM (
                SELECT ${genre}.id, title, year, poster, content_rating, ${genre}.type
                FROM ${genre} 
                INNER JOIN movie ON ${genre}.id = movie.id AND ${genre}.type = movie.type  
                UNION
                SELECT ${genre}.id, title, year, poster, content_rating, ${genre}.type
                FROM ${genre} 
                INNER JOIN show ON ${genre}.id = show.id AND ${genre}.type = show.type
            ) AS t ${where}
            ORDER BY RANDOM() LIMIT ${SECTION_LIMIT}
            `, 
            (err, rows) => {
                if(err){
                    console.error(err.message)
                    resolve({status: 500})
                }
                else{
                    resolve({status: 200, data: rows})
                }
            }
        )
    })
}

function searchMedia(value){
    return new Promise(resolve => {
        media.all(`
            SELECT *
            FROM (
                SELECT id, title, year, poster, content_rating, type 
                FROM movie  
                WHERE 
                    title LIKE '%${value}' OR title LIKE '%${value}%' OR title LIKE '${value}%' 
                
                UNION
                SELECT id, title, year, poster, content_rating, type
                FROM show
                WHERE 
                    title LIKE '%${value}' OR title LIKE '%${value}%' OR title LIKE '${value}%' 
                
            ) AS t
            ORDER BY CASE
                WHEN title = "${value}" THEN 1
                WHEN title LIKE '${value}%' THEN 2
                WHEN title LIKE '%${value}' THEN 3
                WHEN title LIKE '%${value}%' THEN 4
            END
            `, 
            (err, rows) => {
                if(err){
                    console.error(err.message)
                    resolve({status: 500})
                }
                else{
                    resolve({status: 200, data: rows})
                }
            }
        )
    })
}

function searchMovie(movieId){
    return new Promise(resolve => {
        media.get(`SELECT * FROM movie WHERE id = ${movieId}`, (err, row) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(row == undefined){
                resolve({status: 404})
            }
            else{
                resolve({status: 200, data: row})
            }
        })
    })
}

function searchShow(showId){
    return new Promise(resolve => {
        media.get(`SELECT * FROM show WHERE id = ${showId}`, (err, row) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(row == undefined){
                resolve({status: 404})
            }
            else{
                resolve({status: 200, data: row})
            }
        })
    })
}

function searchActor(castId){
    return new Promise(resolve => {
        actors.get(`SELECT * FROM list WHERE id = ${castId}`, (err, row) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(row == undefined){
                resolve({status: 404})
            }
            else{
                resolve({status: 200, data: row})
            }
        })
    })
}

function availableSeasons(showId){
    return new Promise(resolve => {
        shows.all(`SELECT DISTINCT season FROM "${showId}" ORDER BY season ASC`, (err, rows) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            resolve({status: 200, data: rows})
        })
    })
}

function getSeason(showId, season){
    return new Promise(resolve => {
        shows.all(`SELECT * FROM "${showId}" WHERE season = ${season}`, (err, rows) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(rows.length == 0){
                resolve({status:404})
            }
            else{
                resolve({status: 200, data: rows})
            }
        })
    })
}

// Database
const users = new sqlite3.Database(USER_DATA_PATH, sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error(err.message)
    }

    users.run('CREATE TABLE list(id, name, image, child)', (err)=>{
        if(err){
            console.error(err.message)
        }
    })
})

const media = new sqlite3.Database(MEDIA_DATA_PATH, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error(err.message)
    }
})

const actors = new sqlite3.Database(CAST_DATA_PATH, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error(err.message)
    }
})

const shows = new sqlite3.Database(SHOW_DATA_PATH, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error(err.message)
    }
})