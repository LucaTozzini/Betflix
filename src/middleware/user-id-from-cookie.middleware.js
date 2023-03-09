function userIdFromCookie(req, res, next){
    try{
        res.locals.userId = req.cookies.userId;
        next();
    }
    catch(err){
        console.error(err.message);
        res.sendStatus(500);
    }
}

export default userIdFromCookie;