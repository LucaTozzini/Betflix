import sqlite3 from 'sqlite3'
import media from '../helpers/media-database.helpers.js'

const SECTION_LIMIT = 50

function getGenre(genre, type){
    return new Promise(resolve => {
        let where = ''
        if(type == 1){
            where = 'WHERE type = "movie"'
        }
        else if(type == 2){
            where = 'WHERE type = "show"'
        }
        
        media.all(`
            SELECT *
            FROM (
                SELECT ${genre}.id, title, year, poster, content_rating, ${genre}.type
                FROM ${genre} 
                INNER JOIN movie ON ${genre}.id = movie.id AND ${genre}.type = movie.type  
                UNION
                SELECT ${genre}.id, title, year, poster, content_rating, ${genre}.type
                FROM ${genre} 
                INNER JOIN show ON ${genre}.id = show.id AND ${genre}.type = show.type
            ) AS t ${where}
            ORDER BY RANDOM() LIMIT ${SECTION_LIMIT}
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

export default getGenre