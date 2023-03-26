import express from 'express';
import fs from 'fs';

import dataSearch from '../helpers/data-search.helpers.js';
import mediaManager from '../helpers/media-manager.helpers.js';
import usersManager from '../helpers/users-manager.helpers.js';

const router = express.Router();

router.get('/i/:media_id', async(req, res) => {
    try{
        // Authenticate User
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');

        // Get User Data
        const user = await usersManager.user(req.cookies.user_id);

        // Get Media Data
        let data = await dataSearch.media(req.params.media_id);
        const cast = await dataSearch.credits(data.media_id);
        data.cast = cast;

        if(data.item_type == 2){
            data.av_seasons = await dataSearch.availableSeasons(req.params.media_id);
            const season_num = req.query.s || data.av_seasons[0];
            data.season_num = season_num;
            data.episodes = await dataSearch.season(req.params.media_id, season_num);

        }
        res.render('media-page', {user, data});
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
})

router.get('/p/:media_id', async (req, res) => {
    try{
        const user_id = req.cookies.user_id;
        const media_id = req.params.media_id;
        const auth = usersManager.authenticate(user_id);
        if(!auth) res.redirect('/user');
        
        const data = await dataSearch.media(media_id);

        if(data.item_type == 2){
            const episode = req.query.e == undefined ? await dataSearch.firstAvailableEpisode(media_id) : await dataSearch.episode(req.query.e);
            data.title = `${data.title} - S${episode.season_num}E${episode.episode_num} ${episode.title}`            
            data.path = episode.path;
            data.episode_id = episode.episode_id;
            data.duration = episode.duration;
        }

        const resume = await usersManager.getResume(user_id, media_id, data.episode_id || -1);
        res.render('video-player', {data, resume})
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/s/:media_id', async (req, res)=>{
    try{
        const range = req.headers.range

        if (!range) {
            res.status(400).send("Requires Range header");
        }

        const media = await dataSearch.media(req.params.media_id);
        let videoPath = media.path;
        
        if(media.item_type == 2){
            const episode = await dataSearch.episode(req.query.e);
            videoPath = episode.path;
        }

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

router.get('/manager', async (req, res) => {
    try{
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');
        const user = await usersManager.user(req.cookies.user_id);
        res.render('media-manager', {user});
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/manager/reset', async (req, res) => {
    try{
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');
        mediaManager.resetMedia();
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/manager/add/:action', async (req, res) => {
    try{
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');
        const action = req.params.action;

        if(action == 'shows') mediaManager.addShows();
        else if(action == 'movies') mediaManager.addMovies();
        else if(action == 'credits') mediaManager.addCredits();
        else if(action == "clean") mediaManager.clean();
        else res.sendStatus(404);
        
        res.sendStatus(200);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/manager/updater', async (req, res) => {
    try{
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');
        res.json({
            progress: mediaManager.PROGRESS,
            update: mediaManager.UPDATE,
            busy: mediaManager.BUSY
        })
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;