import users from './users-database.helpers.js'

function updateContinueMovie(userId, movieId, percent){
    return new Promise(resolve => {
        users.run(`
            UPDATE ${userId}_continue 
            SET percent = $percent, time_stamp = $time_stamp 
            WHERE type = 'movie' AND id = $id`, 
            {
                $id: parseInt(movieId), 
                $percent: parseFloat(percent),
                $time_stamp: Date.now()
            }, 
            function(err){
                if(err){
                    console.error(err.message)
                    resolve()
                } 
                else if(this.changes === 0){
                    users.run(`INSERT INTO ${userId}_continue VALUES ('movie', $id, $percent, null, null, $time_stamp)`, 
                    { 
                        $id: parseInt(movieId), 
                        $percent: parseFloat(percent), 
                        $time_stamp: Date.now() 
                    }, 
                    (err) => {
                        if(err){
                            console.error('updateContinur', err.message)
                        }
                        resolve()
                    })
                }
                else{
                    resolve()
                }
            }
        )
    })
}

export default updateContinueMovie