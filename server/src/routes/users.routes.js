import fs from 'fs';
import env from '../../env.js';
import express from 'express';

import { userList } from '../helpers/search.helpers.js';
import { addUser, authenticateUser, userData, updateContinue, continueList } from '../helpers/users.helpers.js';

const router = express.Router();

router.get('/list', async (req, res) => {
    try{
        const data = await userList();
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/images', async (req, res) => {
    try{
        const images = fs.readdirSync(env.userImagesPath);
        const paths = images.map(i => `user-images/${i}`);
        res.json(paths);  
    }
    catch(err){
        res.sendStatus(500);
    }
});

router.post('/add', async (req, res) => {
    try{
        const { userName, userImage, childAccount } = req.body;
        await addUser(userName, userImage, childAccount);
        res.sendStatus(201);
    }
    catch(err){
        console.log(err.message);
        res.sendStatus(500);
    }
});

router.post('/data', async (req, res) => {
    try{
        const { userId, userPin } = req.body;
        
        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);
        const data = await userData(userId);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/update-continue', async (req, res) => {
    try{
        const { userId, userPin, mediaId, episodeId, progressTime, endTime } = req.body;

        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401);

        await updateContinue(userId, mediaId, episodeId, progressTime, endTime);
        res.sendStatus(200);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }

});

router.post('/continue', async(req, res) => {
    try{
        const { userId, userPin, limit } = req.body;

        const auth = await authenticateUser(userId, userPin);
        if(!auth) return res.sendStatus(401)

        const data = await continueList(userId, limit || 30);
        res.json(data);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;