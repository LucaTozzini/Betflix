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
        const resume = await usersManager.allResume(req.cookies.user_id, 20);

        // Array Of All Genres In Database
        const genres = [
            'Action', 
            'Adventure', 
            'Animation', 
            'Comedy', 
            'Crime', 
            'Documentary', 
            'Drama', 
            'Family', 
            'Fantasy', 
            'History', 
            'Horror', 
            'Music', 
            'Mystery', 
            'Romance', 
            'Sci-Fi', 
            'Thriller', 
            'War'
        ];

        // Get Data For Each Genre
        let media = {};
        for(const genre of genres){
            try{
                media[genre] = await dataSearch.genre(genre, req.cookies.user_id);
            }
            catch(err){
                console.error(err.message);
            }
        };

        res.render('home', {user, media, resume});
    }

    // If An Error Occurs
    // Respond With Internal Server Error (500)
    catch(err){
        console.error('/home:', err.message)
        res.sendStatus(500)
    }
})

export default router