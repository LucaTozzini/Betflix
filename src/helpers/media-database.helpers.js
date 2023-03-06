import sqlite3 from 'sqlite3';
import env from '../../env.js'

const media = new sqlite3.Database(env.mediaDatabasePath, sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('media', err.message)
    }
})

export default media