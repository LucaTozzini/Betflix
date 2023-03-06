import media from '../helpers/media-database.helpers.js'

function getMovieData(req, res, next){
    try{
        media.get(`SELECT * FROM movie WHERE id = ${res.locals.movieId}`, (err, row) => {
            if(err){
                console.error(err.message)
                return res.status(500).send()
            }
            else if(row == undefined){
                return res.status(404).send('movie not found :(')
            }
            row.path = '../'+row.path
            res.locals.movieData = row
            next()
        })
    }
    catch{
        res.sendStatus(500)
    }
}

export default getMovieData