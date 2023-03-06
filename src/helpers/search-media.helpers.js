import media from './media-database.helpers.js'

function searchMedia(value){
    return new Promise(resolve => {
        media.all(`
            SELECT *
            FROM (
                SELECT id, title, year, poster, content_rating, type 
                FROM movie  
                WHERE 
                    title LIKE '%${value}' OR title LIKE '%${value}%' OR title LIKE '${value}%' 
                
                UNION
                SELECT id, title, year, poster, content_rating, type
                FROM show
                WHERE 
                    title LIKE '%${value}' OR title LIKE '%${value}%' OR title LIKE '${value}%' 
                
            ) AS t
            ORDER BY CASE
                WHEN title = "${value}" THEN 1
                WHEN title LIKE '${value}%' THEN 2
                WHEN title LIKE '%${value}' THEN 3
                WHEN title LIKE '%${value}%' THEN 4
            END
            `, 
            (err, rows) => {
                if(err){
                    console.error(err.message)
                    resolve({status: 500})
                }
                else{
                    resolve({status: 200, data: rows})
                }
            }
        )
    })
}

export default searchMedia