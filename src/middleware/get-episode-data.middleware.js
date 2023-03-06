import shows from '../helpers/shows-database.helpers.js'

function getEpisodeData(req, res, next){
    shows.get(`SELECT * FROM "${res.locals.showId}" WHERE id = ${res.locals.episodeId}`, (err, row) => {
        if(err){
            console.error(err.message)
            res.sendStatus(500)
        }
        else if(row == undefined){
            res.sendStatus(404)
        }
        else{
            res.locals.episodeData = row
            next()
        }
    })
}

export default getEpisodeData