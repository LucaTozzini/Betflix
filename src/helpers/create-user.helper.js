import uniqid from 'uniqid'

// Import Helpers
import users from '../helpers/users-database.helpers.js'
import createContinueTable from './create-continue-table.helper.js'
import createWatchlistTable from './create-watchlist-table.helper.js'

function createUser($name, $image, $child){
    return new Promise(async resolve => {
        try{
            // Create Unique Id For User
            const $id = uniqid('user_')

            // Insert User Into Users List
            const list = await new Promise(resolve => {
                users.run(`INSERT INTO list VALUES ($id, $name, $image, $child)`, {$id, $name, $image, $child}, (err) => {
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

            if(list.status == 500){
                throw new Error()
            }

            const cont = await createContinueTable($id)
            const wtch = await createWatchlistTable($id)

            if(cont.status == 500 || wtch.status == 500){
                throw new Error()
            }
            
            resolve({status: 201})
        }

        // If An Error Occurs
        // Resolve With Internal Server Error (500) 
        catch(e){
            console.error(e.message)
            resolve({status: 500})
        }
    })
}

export default createUser