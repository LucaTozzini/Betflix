import sqlite3 from 'sqlite3'

const shows = new sqlite3.Database('C:/Users/luca_/OneDrive/Desktop/betflix_local/data/media/show.db', sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('show', err.message)
    }
})

export default shows