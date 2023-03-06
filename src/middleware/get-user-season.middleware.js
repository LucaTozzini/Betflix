import users from '../helpers/users-database.helpers.js'
import availableSeasons from '../helpers/available-seasons.helpers.js'

function getUserSeason(req, res, next){
    try{
        users.get(`SELECT season FROM ${res.locals.userId}_continue WHERE type = "show" AND id = ${res.locals.showId} ORDER BY time_stamp DESC`, async (err, row) => {
            if(err){
                return res.status(500).send()
            }
            else if(row != undefined){
                res.locals.userSeason = row.season
            }
            else{
                const all = await availableSeasons(res.locals.showId)
                
                if(all.status == 500){
                    return res.status(500).send()
                }

                res.locals.userSeason = all.data[0].season
                next()
            }
        })
    }
    catch{
        res.status(500).send()
    }
}

export default getUserSeason