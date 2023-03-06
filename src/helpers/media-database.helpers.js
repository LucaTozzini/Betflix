import sqlite3 from 'sqlite3'

const media = new sqlite3.Database('C:/Users/luca_/OneDrive/Desktop/betflix_local/data/media.db', sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('media', err.message)
    }
})

export default media