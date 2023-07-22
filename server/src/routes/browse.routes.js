import express from 'express';
import { authenticateUser, inWatchlist } from '../helpers/users.helpers.js';
import { browseGenres, mediaInfo, mediaGenres, mediaCast, availableSeasons, mediaSeason, mediaEpisode } from '../helpers/search.helpers.js';

const router = express.Router();

router.post('/item', async (req, res) => {
    try{
        const
        mediaId = req.body.mediaId,
        userId = req.body.userId,
        userPin = req.body.userPin;
    
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
        const
        userId = req.body.userId,
        userPin = req.body.userPin,
        limit = req.body.limit || 30;
    
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);

        const data = await browseGenres(limit);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/season', async (req, res) => {
    try{
        const
        userId = req.body.userId,
        userPin = req.body.userPin,
        mediaId = req.body.mediaId,
        seasonNum = req.body.seasonNum;

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
        const data = await mediaEpisode(episodeId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;