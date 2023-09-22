import express from 'express';
import { fetchImages } from '../helpers/TMDb-api.helpers.js';
import { authenticateUser, inWatchlist, watchAgain } from '../helpers/users.helpers.js';
import { 
    browseGenres,
    genre,
    personInfo,
    mediaInfo, 
    mediaGenres, 
    mediaCast, 
    availableSeasons, 
    mediaSeason, 
    mediaEpisodeInfo, 
    searchMedia, 
    latestReleases, 
    latestEpisodes, 
    topRated, 
    dateRange,
    filmography,
} from '../helpers/queries.helpers.js';


const router = express.Router();

router.post('/item', async (req, res) => {
    try{
        const { mediaId, userId, userPin } = req.body;
    
        const auth = await authenticateUser(userId, isNaN(userPin) ? null : userPin);
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

router.get('/person', async (req, res) => {
    try {
        const { personId } = req.query;
        const data = await personInfo(personId);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/genres', async (req, res) => {
    try{
        const { type, limit } = req.query;
        const data = await browseGenres(type || 1, limit || 30);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/genre', async (req, res) => {
    try {
        const { genreName, limit } = req.query;
        if(!genreName) return res.sendStatus(400);
        const data = await genre(genreName, limit || 30);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/season', async (req, res) => {
    try{
        const { userId, userPin, mediaId, seasonNum} = req.body;

        if(!seasonNum) return res.sendStatus(400);

        const auth = await authenticateUser(userId, isNaN(userPin) ? null : userPin);
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

router.get('/latest/releases', async (req, res) => {
    try{
        const { limit } = req.query;
        const data = await latestReleases(limit || 30);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.get('/latest/episodes', async (req, res) => {
    try{
        const { limit } = req.query;
        const data = await latestEpisodes(limit);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.get('/top-rated', async (req, res) => {
    try{
        const { limit, minVote } = req.query;
        const data = await topRated(limit, minVote);
        res.json(data);
    }
    catch(err) {
        console.error(err.message)
        res.sendStatus(500);
    }
});

router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        
        if(!startDate || !endDate) return res.sendStatus(400);
        const data = await dateRange(startDate, endDate, limit);
        res.json(data);
    }
    catch(err) {
        console.log(err.message);
        res.sendStatus(500);
    }
});

router.get('/filmography', async (req, res) => {
    try {
        const { personId, limit } = req.query;
        const data = await filmography(personId, limit || 30);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/watch-again', async (req, res) => {
    try {
        const { userId, userPin, limit } = req.body;
        const auth = await authenticateUser(userId, isNaN(userPin) ? null : userPin);
        if(!auth) return res.sendStatus(401);
        const data = await watchAgain(userId, limit);
        res.json(data);
    }   
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/images', async (req, res) => {
    try {
        const { mediaId } = req.query;
        const data = await fetchImages(mediaId);
        res.json(data);
    }
    catch(err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;