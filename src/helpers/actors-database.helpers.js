import sqlite3 from 'sqlite3';
import env from '../../env.js';

const actors = new sqlite3.Database(env.castDatabasePath, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('actor', err.message);
    }
});

export default actors;