import actors from './actors-database.helpers.js'

function searchActor(castId){
    return new Promise(resolve => {
        actors.get(`SELECT * FROM list WHERE id = ${castId}`, (err, row) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(row == undefined){
                resolve({status: 404})
            }
            else{
                resolve({status: 200, data: row})
            }
        })
    })
}

export default searchActor