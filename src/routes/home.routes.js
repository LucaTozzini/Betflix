import express from 'express'

import getGenre from '../helpers/get-genre.helpers.js'

import authUser from '../middleware/auth-user.middleware.js'
import userIdFromCookie from '../middleware/user-id-from-cookie.middleware.js'

const router = express.Router()

router.get('/', 
    userIdFromCookie, 
    authUser, 
    async (req, res) => {
        try{
            // Array Of All Genres In Database
            const genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Sci_Fi', 'Thriller', 'War']

            // Get Data For Each Genre
            let media = {}
            for(const genre of genres){
                media[genre] = await getGenre(genre, 0)

                // If An Error Occurs Retrieving Data
                // Throw Error
                if(media[genre].status == 500){
                    throw new Error()
                }
            }

            res.render('home', {user: res.locals.userData, media})
        }

        // If An Error Occurs
        // Respond With Internal Server Error (500)
        catch(err){
            console.error('/home/ .get', err.message)
            res.sendStatus(500)
        }
    }
)

export default router