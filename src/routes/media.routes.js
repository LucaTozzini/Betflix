import express from 'express';
import fs from 'fs';

import getSeason from '../helpers/get-season.helpers.js';
import searchShow from '../helpers/search-show.helpers.js';
import searchMovie from '../helpers/search-movie.helpers.js';
import searchActor from '../helpers/search-actor.helpers.js';
import availableSeasons from '../helpers/available-seasons.helpers.js';

import authUser from '../middleware/auth-user.middleware.js';
import getMovieData from '../middleware/get-movie-data.middleware.js';
import getUserSeason from '../middleware/get-user-season.middleware.js';
import getEpisodeData from '../middleware/get-episode-data.middleware.js';
import userMovieResume from '../middleware/user-movie-resume.middleware.js';
import showIdFromParam from '../middleware/show-id-from-param.middleware.js';
import userIdFromCookie from '../middleware/user-id-from-cookie.middleware.js';
import movieIdFromParam from '../middleware/movie-id-from-param.middleware.js';
import showEpisodeIdFromParam from '../middleware/show-episode-id-from-param.middleware.js';

const router = express.Router();

router.get('/movie/:movieId', 
    userIdFromCookie,
    authUser,
    async (req, res) => {
        try{
            const id = req.params.movieId
            const movie = await searchMovie(id)
            
            if(movie.status == 404){
                return res.sendStatus(404)
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
            console.error('/media/movie/id .get', e.message)
            res.sendStatus(500)
        }
    }
);

router.get('/show/:showId', 
    userIdFromCookie,
    authUser,
    showIdFromParam,
    getUserSeason,
    async (req, res) => {
        try{
            res.redirect(`${res.locals.showId}/${res.locals.userSeason}`)
        }
        catch{
            res.sendStatus(500)
        }
    }
);

router.get('/show/:showId/:season', 
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
            res.sendStatus(500)
        }
    }
);

router.get('/stream/movie/:movieId', 
    userIdFromCookie,
    authUser,
    movieIdFromParam,
    getMovieData,
    (req, res)=>{
    try{
        const range = req.headers.range

        if (!range) {
            res.status(400).send("Requires Range header");
        }
        
        const videoPath = res.locals.movieData.path
        const videoSize = fs.statSync(videoPath).size;
    
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const NUM_CHUNKS = 1 //how many chunks to send
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + (CHUNK_SIZE * NUM_CHUNKS), videoSize - 1) //subtract 1 because start at 0
        const contentLength = end - start + 1
    
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        }
    
        res.writeHead(206, headers)
        const videoStream = fs.createReadStream(videoPath, { start, end })
        videoStream.pipe(res)
    }
    catch(err){
        console.error('stream', err.message)
        res.sendStatus(500)
    }
});

router.get('/stream/show/:showId/:episodeId', 
    userIdFromCookie,
    authUser,
    showEpisodeIdFromParam,
    getEpisodeData,
    (req, res) => {
        const range = req.headers.range

        if (!range) {
            res.status(400).send("Requires Range header");
        }
        
        const videoPath = '../'+res.locals.episodeData.path
        const videoSize = fs.statSync(videoPath).size;
    
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const NUM_CHUNKS = 1 //how many chunks to send
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + (CHUNK_SIZE * NUM_CHUNKS), videoSize - 1) //subtract 1 because start at 0
        const contentLength = end - start + 1
    
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/mp4",
        }
    
        res.writeHead(206, headers)
        const videoStream = fs.createReadStream(videoPath, { start, end })
        videoStream.pipe(res)
    }
);

router.get('/player/movie/:movieId', 
    userIdFromCookie,
    authUser,
    movieIdFromParam,
    getMovieData,
    userMovieResume,
    (req, res) => {
        try{
            res.render('video-player', {itemData: res.locals.movieData, resume: res.locals.movieResume})
        }
        catch{
            res.sendStatus(500)
        }
});

router.get('/player/show/:showId/:episodeId', 
    userIdFromCookie,
    authUser,
    showEpisodeIdFromParam,
    getEpisodeData,
    (req, res) => {
        try{
            res.render('video-player', {itemData: res.locals.episodeData, showId: res.locals.showId, resume: 0})
        }
        catch{
            res.sendStatus(500)
        }
    }
);

router.get('/player/show/:showId',
    userIdFromCookie,
    authUser,
    showIdFromParam,
    getUserSeason,
    (req, res) => {
        res.redirect(`/media/player/show/${req.params.showId}/${res.locals.userEpisodeId}`)
    }
);





export default router