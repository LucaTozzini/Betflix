import sqlite3 from 'sqlite3'

const actors = new sqlite3.Database('C:/Users/luca_/OneDrive/Desktop/betflix_local/data/cast.db', sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error('actor', err.message)
    }
})

export default actors