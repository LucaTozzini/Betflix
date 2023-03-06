import express from 'express'

import searchMedia from '../helpers/search-media.helpers.js'

import authUser from '../middleware/auth-user.middleware.js'
import userIdFromCookie from '../middleware/user-id-from-cookie.middleware.js'

const router = express.Router()

router.get('/',
    userIdFromCookie,
    authUser,
    async (req, res) => {
        try{
            res.render('search', {user: res.locals.userData})
        }
        catch{
            res.status(500)
        }
    }
)

router.post('/', async (req, res) => {
    try{
        const value = req.body.value

        if(value.length == 0){
            return res.json({html: ``})
        }

        const results = await searchMedia(value)

        if(results.status == 500){
            throw new Error()
        }

        let html = ''
        for(const item of results.data){
            html += `
            <a class="media-item" data-id="${item.id}" data-type="${item.type}">
                <div class="media-poster" style="background-image: url('${item.poster}')">
                    <div class="media-overlay">
                        <div class="media-overlay-button watchlist-add"></div>
                        <div class="media-overlay-button play"></div>
                    </div>
                </div>
                <div class="media-title">${item.title}</div>
                <div class="media-year">${item.year}</div>
            </a>
            `
        }

        res.json({html})
    }
    catch(e){
        console.error(e.message)
        res.sendStatus(500)
    }
})

export default router