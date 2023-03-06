import users from '../helpers/users-database.helpers.js'

function userMovieResume(req, res, next){
    users.get(`SELECT percent FROM ${res.locals.userId}_continue WHERE type = "movie" AND id = ${res.locals.movieData.id}`, (err, row) => {
        if(err){
            console.error(err.message)
            res.status(500).send()
        }
        res.locals.movieResume = row == undefined ? 0 : row.percent
        next()
    }) 
}

export default userMovieResume