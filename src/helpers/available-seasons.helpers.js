import shows from './shows-database.helpers.js'

function availableSeasons(showId){
    return new Promise(resolve => {
        shows.all(`SELECT DISTINCT season FROM "${showId}" ORDER BY season ASC`, (err, rows) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            resolve({status: 200, data: rows})
        })
    })
}

export default availableSeasons