import express from 'express';
import { authenticateUser, inWatchlist } from '../helpers/users.helpers.js';
import { browseGenres, mediaInfo, mediaGenres, mediaCast, availableSeasons, mediaSeason, mediaEpisodeInfo } from '../helpers/search.helpers.js';

const router = express.Router();

router.post('/item', async (req, res) => {
    try{
        const { mediaId, userId, userPin } = req.body;
    
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);

        const data = await mediaInfo(mediaId, userId);
        data['GENRES'] = await mediaGenres(mediaId);
        data['CAST'] = await mediaCast(mediaId);
        data['IN_WATCHLIST'] = await inWatchlist(userId, mediaId) ? 1 : 0;
        if(data.TYPE == 2) {
            data['AVAILABLE_SEASONS'] = await availableSeasons(mediaId);
        } 
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/genres', async (req, res) => {
    try{
        const { userId, userPin, limit } = req.body;
    
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);

        const data = await browseGenres(limit || 30);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/season', async (req, res) => {
    try{
        const { userId, userPin, mediaId, seasonNum} = req.body;

        if(!seasonNum) return res.sendStatus(400);

        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        if(!mediaId) return res.sendStatus(400);
        
        
        const EPISODES = await mediaSeason(mediaId, seasonNum, userId);
        const data = { SEASON_NUM: seasonNum, EPISODES }
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
    
});

router.post('/episode', async (req, res) => {
    try{
        const episodeId = parseInt(req.body.episodeId);
        const data = await mediaEpisodeInfo(episodeId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;