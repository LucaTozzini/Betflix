import users from '../helpers/users-database.helpers.js'

function authUser(req, res, next){
    users.get(`SELECT * FROM list WHERE id = "${res.locals.userId}"`, (err, row) => {
        // If An Error Occurs
        // Resolve With Internal Server Error (500) 
        if(err){
            console.error(err.message)
            return res.status(500).send()
        }

        // If User Does Not Exist
        // Resolve With Bad Request (400)
        else if(row == undefined){
            return res.status(400).redirect('/user')
        }

        // If User Is Found
        // Go To Next Function
        
        res.locals.userData = row
        res.locals.userAuth = true
        next()
    })
}

export default authUser