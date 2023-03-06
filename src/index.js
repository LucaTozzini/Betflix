import ejs from 'ejs'
import express from 'express'
import cookieParser from 'cookie-parser'

import home_routes from './routes/home.routes.js'
import user_routes from './routes/user.routes.js'
import search_routes from './routes/search.routes.js'
import media_routes from './routes/media.routes.js'

const app = express()

const PORT = 80
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.redirect('/home')
})

app.use('/user', user_routes)

app.use('/home', home_routes)

app.use('/search', search_routes)

app.use('/media', media_routes)

// Start Server
app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`)
})

