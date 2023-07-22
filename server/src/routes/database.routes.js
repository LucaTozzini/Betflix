import express from 'express';
import { manager } from '../helpers/database.helpers.js';

const router = express.Router();

router.get('/status', (req, res) => {
    try{
        res.json(manager.status);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.get('/run', (req, res) => {
    try{
        const action = parseInt(req.query.action);
        manager.run(action);
        res.sendStatus(200);
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

export default router;