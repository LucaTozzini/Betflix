function show_episode_IdFromParam(req, res, next){
    try{
        res.locals.showId = req.params.showId
        res.locals.episodeId = req.params.episodeId
        next()
    }
    catch(err){
        console.error(err.message)
        res.sendStatus(500)
    }
}

export default show_episode_IdFromParam