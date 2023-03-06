function userIdFromBody(req, res, next){
    try{
        res.locals.userId = req.body.userId
        next()
    }
    catch{
        res.sendStatus(500)
    }
}

export default userIdFromBody