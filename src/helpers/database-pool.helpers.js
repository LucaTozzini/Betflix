import sqlite3 from 'sqlite3';
import env from '../../env.js';

const db = new sqlite3.Database(env.databasePath, sqlite3.OPEN_READWRITE, (err) => { 
    if(err){
        console.error('test', err.message); 
    }
});

export default db;