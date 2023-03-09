import users from '../helpers/users-database.helpers.js';
import availableSeasons from '../helpers/available-seasons.helpers.js';
import firstAvailableEpisode from '../helpers/first-available-episode.helpers.js';

function getUserSeason(req, res, next){
    try{
        users.get(`SELECT season, id FROM ${res.locals.userId}_continue WHERE type = "show" AND id = ${res.locals.showId} ORDER BY time_stamp DESC`, async (err, row) => {
            if(err){
                console.error(err.message)
                return res.sendStatus(500);
            }
            else if(row != undefined){
                res.locals.userSeason = row.season;
                res.locals.userEpisodeId = row.id;
            }
            else{
                const seasons = await availableSeasons(res.locals.showId);
                const firstEpisode = await firstAvailableEpisode(res.locals.showId);

                res.locals.userSeason = seasons.data[0].season
                res.locals.userEpisodeId = firstEpisode.id
                next()
            }
        })
    }
    catch{
        res.status(500).send()
    }
}

export default getUserSeason