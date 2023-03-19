import express from 'express'

import dataSearch from '../helpers/data-search.helpers.js';
import usersManager from '../helpers/users-manager.helpers.js';

const router = express.Router()

router.get('/', async (req, res) => {
    try{
        // Authenticate User
        const auth = await usersManager.authenticate(req.cookies.user_id);
        if(!auth) return res.status(401).redirect('/user');

        // Get User Data
        const user = await usersManager.user(req.cookies.user_id);

        res.render('search', {user})
    }
    catch{
        res.sendStatus(500);
    }
})

router.post('/', async (req, res) => {
    try{
        const value = req.body.value

        // If Empty Value
        if(value.length == 0) return res.json({html: ``})

        const data = await dataSearch.title(value);

        res.render('partials/media-items', {data})
    }
    catch(err){
        console.error(err.message)
        res.sendStatus(500)
    }
})

export default router