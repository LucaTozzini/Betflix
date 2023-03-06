import users from '../helpers/users-database.helpers.js'

function getUsers(req, res, next){
    users.all(`SELECT * FROM list`, [], (err, rows) => {
        if(err){
            console.error(err.message)
            return res.sendStatus(500)
        }

        res.locals.userList = rows
        next()
    })
}

export default getUsers