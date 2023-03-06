function movieIdFromParam(req, res, next){
    try{
        res.locals.movieId = req.params.movieId
        next()
    }
    catch{
        res.sendStatus(500)
    }
}

export default movieIdFromParam