import media from './media-database.helpers.js'

function searchMovie(movieId){
    return new Promise(resolve => {
        media.get(`SELECT * FROM movie WHERE id = ${movieId}`, (err, row) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(row == undefined){
                resolve({status: 404})
            }
            else{
                row.path = '../'+row.path
                resolve({status: 200, data: row})
            }
        })
    })
}

export default searchMovie