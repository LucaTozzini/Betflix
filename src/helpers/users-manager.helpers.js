import db from './database-pool.helpers.js';
import uniqid from 'uniqid'
import dataSearch from './data-search.helpers.js';

const usersManager = {
    updateContinue(user_id, media_id, percent, episode_id){
        return new Promise(async (resolve, reject) => {
            const timestamp = new Date().toISOString().replace('T', ' ').replace(/\..+/, '').replace(/[^0-9]/g, '');
            const key = `${user_id}_${media_id}_${episode_id}`;

            const key_exists = await new Promise((res, rej) => {
                db.get('SELECT key FROM user_continue WHERE key = ?', [key], (err, row) => {
                    if(err) rej(err);
                    if(row == undefined) res(false);
                    else res(true);
                })
            })

            if(percent > 95 && episode_id > -1){
                const next = await dataSearch.nextEpisode(episode_id);
                if(next == undefined) resolve();
                const next_key = `${user_id}_${media_id}_${next.episode_id}`;
                db.run(`
                    INSERT INTO user_continue(key, user_id, media_id, percent, episode_id, time_stamp) 
                    VALUES (?, ?, ?, ?, ?, ?)`, 
                    [next_key, user_id, media_id, 0, next.episode_id, timestamp],
                    (err) => {
                        if(err) reject(err);
                        else resolve();
                    }
                );
            }
            
            if(key_exists){
                db.run(`
                    UPDATE user_continue
                    SET percent = ?, time_stamp = ? 
                    WHERE key = ?`, 
                    [percent, timestamp, key],
                    (err) => {
                        if(err) reject(err);
                        else resolve();
                    }
                );
            }
            else{
                db.run(`
                    INSERT INTO user_continue(key, user_id, media_id, percent, episode_id, time_stamp) 
                    VALUES (?, ?, ?, ?, ?, ?)`, 
                    [key, user_id, media_id, percent, episode_id, timestamp],
                    (err) => {
                        if(err) reject(err);
                        else resolve();
                    }
                );
            }
        })
    },

    removeContinue(user_id, media_id, episode_id){
        return new Promise((resolve, reject) => {
            const data = [user_id, media_id];
            if(episode_id > 0) data.push(episode_id);
            db.run(`
                DELETE FROM user_continue 
                WHERE user_id = ? AND media_id = ? ${episode_id > 0 ? ' AND episode_id = ?' : ''}`,
                data,
                (err) => {
                    if(err) reject(err);
                    else resolve();
                }
            )
        })
    },

    getResume(user_id, media_id, episode_id){
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT percent 
                FROM user_continue 
                WHERE user_id = ? AND media_id = ? AND episode_id = ? AND percent <= 95`, 
                [user_id, media_id, episode_id], 
                (err, row) => {
                    if(err) reject(err);
                    else if(row == undefined) resolve(0);
                    else resolve(row.percent);
                }
            )
        })
    },

    allResume(user_id, max){
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT u.*, m.*, e.title AS episode_title, e.season_num, e.episode_num, e.still_large
                FROM user_continue AS u
                JOIN media AS m ON m.media_id = u.media_id
                LEFT JOIN episodes AS e ON e.episode_id =  u.episode_id 
                WHERE user_id = ? AND percent <= 95
                ORDER BY u.time_stamp DESC
                LIMIT ?`,
                [user_id, max],
                (err, rows) => {
                    if(err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    createUser(name, image, child){
        return new Promise(async (resolve, reject) => {
            // Create Unique Id For User
            const id = uniqid('user_')
    
            // Insert User Into Users List
            db.run(`INSERT INTO user_list VALUES (?, ?, ?, ?)`, [id, name, image, child], (err) => {
                // If An Error Occurs
                if(err){
                    reject(err)
                }
                // If Insertion Is Successful
                else{
                    resolve()
                }
            })
        })
    },

    userList(){
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM user_list`, [], (err, rows) => {
                if(err) reject(err);
                else resolve(rows);
            })
        })
    },

    authenticate(user_id){
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM user_list WHERE user_id = ?`, [user_id], (err, row) => {
                if(err) return reject(err);
                else resolve(row != undefined ? true : false)
            })
        })
    },

    user(userId){
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM user_list WHERE user_id = ?`, [userId], (err, row) => {
                if(err) return reject(err);
                else resolve(row)
            })
        })
    },

}

export default usersManager;