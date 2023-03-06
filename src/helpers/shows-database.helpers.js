import sqlite3 from 'sqlite3';
import env from '../../env.js';

const shows = new sqlite3.Database(env.showDatabasePath, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('show', err.message)
    }
})

export default shows