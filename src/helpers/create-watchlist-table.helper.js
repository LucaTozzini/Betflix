import users from './users-database.helpers.js'

function createWatchlistTable(userId){
    return new Promise(resolve => {
        users.run(`CREATE TABLE ${userId+'_watchlist'} (type, id, time_stamp)`, (err) => {
            // If An Error Occurs
            // Resolve With Internal Server Error (500)
            if(err){
                console.error('createWatchlistTable', err.message)
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

export default createWatchlistTable