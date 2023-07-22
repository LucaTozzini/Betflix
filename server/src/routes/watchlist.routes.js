import express from 'express';
const router = express.Router();

import { authenticateUser, addWatchlist, removeWatchlist, watchlist } from '../helpers/users.helpers.js';

router.put(`/add`, async (req, res) => {
    try{
        const 
        userId = req.body.userId,
        userPin = req.body.userPin || null,
        mediaId = req.body.mediaId;

        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);

        await addWatchlist(userId, mediaId);
        res.sendStatus(201);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.delete('/remove', async (req, res) => {
    const 
    userId = req.body.userId,
    userPin = req.body.userPin || null,
    mediaId = req.body.mediaId;

    const auth = await authenticateUser(userId, userPin);
    if(!auth) return res.sendStatus(401);

    await removeWatchlist(userId, mediaId);
    res.sendStatus(202);
});

router.post('/', async (req, res) => {
    try{
        const
        userId = req.body.userId,
        userPin = req.body.userPin || null;
    
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
    
        const data = await watchlist(userId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
})

export default router;