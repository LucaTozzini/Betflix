import media from './media-database.helpers.js'

function searchShow(showId){
    return new Promise(resolve => {
        media.get(`SELECT * FROM show WHERE id = ${showId}`, (err, row) => {
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

export default searchShow