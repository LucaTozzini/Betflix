import fs from 'fs'
import ejs from 'ejs'
import express from 'express'

import createUser from '../helpers/create-user.helper.js'
import updateContinueMovie from '../helpers/update-continue-movie.helpers.js'

import authUser from '../middleware/auth-user.middleware.js'
import getUsers from '../middleware/get-users.middleware.js'
import userIdFromBody from '../middleware/user-id-from-body.middleware.js'
import userIdFromCookie from '../middleware/user-id-from-cookie.middleware.js'

const USER_PROFILE_IMG_PATH = '/img/profilePictures/'

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
        const user = await createUser(name, image, child)

        // If An Error Occurs Creating User
        // Throw Error
        if(user.status == 500){
            throw new Error()
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

router.get('/', 
    getUsers,
    (req, res) => {
        try{
            // Render Page
            res.render('select-user', {data: res.locals.userList}) 
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch{
            res.sendStatus(500)
        }
    }
)

router.post('/log/in', 
    userIdFromBody,
    authUser,
    async (req, res) => {
        try{
            res.cookie('userId', res.locals.userData.id, { maxAge: 100000000 })
            res.status(200).send()
        }

        catch{
            res.status(500).send()
        }
    }
)

router.get('/log/out', async (req, res) => {
    try{
        res.cookie('userId', null, { maxAge: 1 });
        res.status(200).send()
    }
    catch{
        res.status(500).send()
    }
})

router.get('/create', (req, res) => {
    try{
        let images = fs.readdirSync('public'+USER_PROFILE_IMG_PATH)
        images = images.map(image => USER_PROFILE_IMG_PATH + image)
        res.render('create-user', {images})
    }
    catch(err){
        console.error(err.message)
        res.sendStatus(500)
    }
})

router.post('/update/continue/movie', 
    userIdFromCookie,
    authUser,
    async (req, res) => {
        await updateContinueMovie(res.locals.userId, req.body.movieId, req.body.percent)
        res.sendStatus(200)
    }
)

export default router