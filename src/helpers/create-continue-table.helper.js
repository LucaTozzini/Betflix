import users from './users-database.helpers.js'

function createContinueTable(userId){
    return new Promise(resolve => {
        users.run(`CREATE TABLE ${userId+'_continue'} (type, id, percent, season, episode, time_stamp)`, (err) => {
            // If An Error Occurs
            // Resolve With Internal Server Error (500)
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            // If Insertion Is Successful
            // Resolve With Created (201)
            else{
                resolve({status: 201})
            }
        })
    })
}

export default createContinueTable