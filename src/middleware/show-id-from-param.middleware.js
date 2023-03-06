function showIdFromParam(req, res, next){
    try{
        res.locals.showId = req.params.showId
        next()
    }
    catch{
        res.sendStatus(500)
    }
}

export default showIdFromParam