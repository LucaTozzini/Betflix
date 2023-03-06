import sqlite3 from 'sqlite3';
import env from '../../env.js';

const users = new sqlite3.Database(env.usersDatabasePath, sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error('users', err.message)
    }
    users.run('CREATE TABLE IF NOT EXISTS list(id, name, image, child)', (err) => {
        if(err){
            console.error(err.message)
        }
    })
})

export default users