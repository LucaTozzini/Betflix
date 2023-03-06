import shows from './shows-database.helpers.js'

function getSeason(showId, season){
    return new Promise(resolve => {
        shows.all(`SELECT * FROM "${showId}" WHERE season = ${season}`, (err, rows) => {
            if(err){
                console.error(err.message)
                resolve({status: 500})
            }
            else if(rows.length == 0){
                resolve({status:404})
            }
            else{
                resolve({status: 200, data: rows})
            }
        })
    })
}

export default getSeason