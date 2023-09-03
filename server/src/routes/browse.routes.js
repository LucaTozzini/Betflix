import express from 'express';
import { authenticateUser, inWatchlist } from '../helpers/users.helpers.js';
import { browseGenres, mediaInfo, mediaGenres, mediaCast, availableSeasons, mediaSeason, mediaEpisodeInfo, searchMedia, latestReleases, latestEpisodes, topRated, dateRange } from '../helpers/queries.helpers.js';

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

router.get('/genres', async (req, res) => {
    try{
        const { limit } = req.query;
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

router.get('/search', async(req, res) => {
    try{
        const { value } = req.query;
        if(!value) return res.status(400).send('Value empty');
        const data = await searchMedia(value);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/latest/releases', async (req, res) => {
    try{
        const { userId, userPin, limit } = req.body;
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        const data = await latestReleases(limit);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.post('/latest/episodes', async (req, res) => {
    try{
        const { userId, userPin, limit } = req.body;
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        const data = await latestEpisodes(limit);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.post('/top-rated', async (req, res) => {
    try{
        const { userId, userPin, limit, minVote } = req.body;
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        const data = await topRated(limit, minVote);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.post('/date-range', async (req, res) => {
    try {
        const { userId, userPin, startDate, endDate, limit } = req.body;
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        if(!startDate || !endDate) return res.sendStatus(400);
        const data = await dateRange(startDate, endDate, limit);
        res.json(data);
    }
    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
});

export default router;