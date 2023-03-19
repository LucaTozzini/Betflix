import fs from 'fs'
import express from 'express'
import usersManager from '../helpers/users-manager.helpers.js';

const router = express.Router()

router.post('/', async (req, res) => {
    try{
        // Format POST Body
        const name = req.body.name.toString().trim()
        const image = req.body.image.toString()
        const child = Boolean(req.body.child)

        // If The Given Name Is Empty
        // Respond With Bad Request (400)
        if(name.length == 0){
            return res.status(400).json({error: 'Invalid Name'})
        }

        // Create User
        try{
            await usersManager.createUser(name, image, child);
        }
        // If Promise Is Rejected
        // Throw Error
        catch(err){
            console.error(err.message);
            throw new Error();
        }

        // If User Is Created Successfully
        // Respond With Created (201) And Redirect To Select User Page
        res.status(201).redirect('/user')
    }

    // If An Error Occurs
    // Respond With Internal Server Error (500)
    catch(err){
        console.error(err.message)
        res.sendStatus(500)
    }
})

router.get('/', async (req, res) => {
    try{
        const data = await usersManager.userList();
        res.render('select-user', {data});
    }

    catch{
        res.sendStatus(500)
    }
    }
)

router.post('/log/in', async (req, res) => {
    try{
        // Authenticate User
        const auth = await usersManager.authenticate(req.body.user_id);
        if(!auth) return res.status(401).redirect('/user');

        const user = await usersManager.user(req.body.user_id);

        res.cookie('user_id', user.user_id, { maxAge: 100000000 });
        res.sendStatus(200);
    }

    catch{
        res.sendStatus(500);
    }
});

router.get('/log/out', async (req, res) => {
    try{
        res.cookie('user_id', null, { maxAge: 1 });
        res.status(200).send()
    }
    catch{
        res.status(500).send()
    }
});

router.get('/create', (req, res) => {
    try{
        let images = fs.readdirSync('public/img/profilePictures/');
        images = images.map(image => '/img/profilePictures/' + image);
        res.render('create-user', {images});
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
});

router.post('/update/continue', 
    async (req, res) => {
        const user_id = req.cookies.user_id;
        const episode_id = req.body.episode_id || -1;
        const media_id = req.body.media_id;
        const percent = req.body.percent;
        
        // Authenticate User
        const auth = await usersManager.authenticate(user_id);
        if(!auth) return res.status(401);

        await usersManager.updateContinue(user_id, media_id, percent, episode_id)
        res.sendStatus(200)
    }
);

export default router;