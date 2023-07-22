import express from 'express';
import fs from 'fs';
import { mediaInfo, mediaEpisodeInfo } from '../helpers/search.helpers.js';
import { authenticateUser, currentEpisode } from '../helpers/users.helpers.js'
import { getMoviePath, getEpisodePath } from '../helpers/filesUtil.helpers.js';

const router = express.Router();

router.get('/stream/', async (req, res) => {
    if(!req.headers.range) return res.sendStatus(400);
    
    const
    type = req.query.type,
    mediaId = req.query.mediaId,
    episodeId = parseInt(req.query.episodeId);

    if(type != 1 && type != 2) return res.sendStatus(400);
    
    const filePath = type == 1 ? await getMoviePath(mediaId) : await getEpisodePath(episodeId);
    if(!filePath) return res.sendStatus(404);
    
    const size = fs.statSync(filePath).size;
    const chunk = 10 ** 6;
    const start = parseInt(req.headers.range.replace(/bytes=/, '').split('-')[0]);
    const end = Math.min(start + chunk, size - 1);
    const contentLength = end - start + 1;
    
    const headers = {
        'Content-Length': contentLength,
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${size}`
    };
    
    res.writeHead(206, headers);
    const stream = fs.createReadStream(filePath, {start, end});
    stream.pipe(res);
});

router.post('/current-episode', async (req, res) => {
    try{
        const
        userId = req.body.userId,
        userPin = req.body.userPin,
        mediaId = req.body.mediaId;
    
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
    
        const data = await currentEpisode(userId, mediaId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;