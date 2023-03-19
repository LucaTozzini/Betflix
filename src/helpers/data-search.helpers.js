import { reject } from "async";
import db from "./database-pool.helpers.js";

const dataSearch = {
    media(media_id){
        return new Promise(resolve => {
            db.get(`SELECT * FROM media WHERE media_id = ?`, [media_id], (err, row) => {
                if(err) reject(err);
                else resolve(row);
            })
        })
    },

    person(personId){
        return new Promise(resolve => {
            db.get(`SELECT * FROM cast WHERE person_id = ?`, [personId], (err, row) => {
                if(err) reject(err)
                else resolve(row)
            })
        })
    },

    season(media_id, season_num){
        return new Promise(resolve => {
            db.all(`SELECT * FROM episodes WHERE media_id = ? AND season_num = ?`, [media_id, season_num], (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            })
        })
    },

    genre(genreName){
        return new Promise((resolve, reject) => {
            const SECTION_LIMIT = 50
            db.all(`
            SELECT * FROM media AS m
            JOIN genre_relations AS gr ON gr.media_id = m.media_id
            JOIN genres AS g ON gr.genre_id = g.genre_id
            WHERE g.genre_name = ?
            ORDER BY RANDOM()
            LIMIT ?
            `, 
            [genreName, SECTION_LIMIT], 
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows)
            })
        })
    },

    title(value){
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT * 
                FROM media 
                WHERE title 
                    LIKE '%${value}' OR 
                    title LIKE '%${value}%' OR 
                    title LIKE '${value}%' 
                ORDER BY CASE
                    WHEN title = "${value}" THEN 1
                    WHEN title LIKE '${value}%' THEN 2
                    WHEN title LIKE '%${value}' THEN 3
                    WHEN title LIKE '%${value}%' THEN 4
                END
                `, 
                (err, rows) => {
                    if(err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    availableSeasons(media_id){
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT DISTINCT season_num 
                FROM episodes AS e
                JOIN media AS m ON e.media_id = m.media_id  
                WHERE m.media_id = ? ORDER BY season_num ASC`, [media_id], (err, rows) => {
                if(err) reject(err);
                else{
                    rows = rows.map(obj => obj.season_num);
                    resolve(rows);
                }
            })
        })
    },

    firstAvailableEpisode(media_id){
        return new Promise(resolve => {
            db.get(`SELECT * FROM episodes WHERE media_id = ? ORDER BY episode_num ASC, season_num ASC`, [media_id], (err, row) => {
                if(err) reject(err);
                else resolve(row);
            })
        })
    },

    episode(episode_id){
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM episodes WHERE episode_id = ?`, [episode_id], (err, row) => {
                if(err) reject(err);
                else resolve(row);
            })
        })
    },

    distinctPeople(){
        return new Promise(resolve => {
            db.all(`SELECT DISTINCT person_id FROM cast_relations`, (err, rows) => {
                if(err){
                    reject(err.message);
                }
                else{
                    rows = rows.map(obj => obj.person_id);
                    resolve(rows);
                }
            })
        })
    },

    credits(mediaId){
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT c.name, c.image, cr.character
                FROM cast AS c
                JOIN cast_relations AS cr ON c.person_id = cr.person_id
                JOIN media AS m ON cr.media_id = m.media_id
                WHERE m.media_id = ?
                ORDER BY cr.credit_order
            `,
            [mediaId],
            (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            })
        })
    }
}

export default dataSearch;