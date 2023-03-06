import sqlite3 from 'sqlite3'

const users = new sqlite3.Database('C:/Users/luca_/OneDrive/Desktop/betflix_local/data/users.db', sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error('users', err.message)
    }
    users.run('CREATE TABLE list(id, name, image, child)', (err) => {
        if(err){
            console.error(err.message)
        }
    })
})

export default users