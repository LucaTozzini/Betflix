import shows from './shows-database.helpers.js';

function firstAvailableEpisode(showId){
    return new Promise(resolve => {
        shows.get(`SELECT * FROM "${showId}" ORDER BY episode ASC, season ASC`, (err, row) => {
            if(err){
                console.error(err.message);
            }
            resolve(row);
        })
    })
}

export default firstAvailableEpisode;