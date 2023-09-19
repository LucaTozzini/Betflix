import express from 'express';
import fs from 'fs';
import send from 'send';
import { authenticateUser, currentEpisode, movieResumeTime, episodeResumeTime } from '../helpers/users.helpers.js'
import { mediaEpisodeInfo, nextEpisode } from '../helpers/queries.helpers.js';
import { getMoviePath, getEpisodePath } from '../helpers/filesUtil.helpers.js';

const router = express.Router();

router.get('/stream', async (req, res) => {
    try{
        if(!req.headers.range) req.headers.range = 'bytes=0-';
        const { type, mediaId, episodeId } = req.query;
        if(type != 1 && type != 2) return res.status(400).send('Invalid type');
        
        const filePath = type == 1 ? await getMoviePath(mediaId) : await getEpisodePath(episodeId);
        if(!filePath) return res.status(404).send('File not found :(');
        
        const size = fs.statSync(filePath).size;
        const chunk = 10 ** 6;
        const start = parseInt(req.headers.range.replace(/bytes=/, '').split('-')[0]);
        const end = Math.min(start + chunk, size - 1);
        const contentLength = end - start + 1;
        
        const headers = {
            'Content-Length': contentLength,
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Type': 'video/mp4',
        };
        
        res.writeHead(206, headers);
        const stream = fs.createReadStream(filePath, {start, end});
        stream.pipe(res);
    }
    catch(err) {
        console.error(err.message);
    }
});

router.get('/video', async (req, res) => {
    try{
        const { type, mediaId, episodeId } = req.query;
        if(type != 1 && type != 2) return res.status(400).send('Invalid type');
        const filePath = type == 1 ? await getMoviePath(mediaId) : await getEpisodePath(episodeId);
        if(!filePath) return res.status(404).send('File not found :(');
        const stream = send(req, filePath);
        stream.pipe(res);
    }
    catch(err) {
        console.error(err)
    }
});

router.post('/current-episode', async (req, res) => {
    try{
        const { userId, userPin, mediaId } = req.body;
    
        const auth = await authenticateUser(userId, isNaN(userPin) ? null : userPin);
        if(!auth) return res.sendStatus(401);
    
        const data = await currentEpisode(userId, mediaId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/resume', async(req, res) => {
    try {
        const { userId, userPin, mediaId, episodeId } = req.body;
        
        const auth = await authenticateUser(userId, isNaN(userPin) ? null : userPin);
        if(!auth) return res.sendStatus(401);

        const data = episodeId ? await episodeResumeTime(userId, episodeId) : await movieResumeTime(userId, mediaId);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/next', async(req, res) => {
    try{
        const { episodeId } = req.body;
        if(!episodeId) return res.sendStatus(400);
        const {MEDIA_ID, SEASON_NUM, EPISODE_NUM} = await mediaEpisodeInfo(episodeId);
        const next = await nextEpisode(MEDIA_ID, SEASON_NUM, EPISODE_NUM);
        res.json(next);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;