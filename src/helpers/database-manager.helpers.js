const dbManager = {
    insert(prep, data){
        return new Promise((resolve, reject) => {
            prep.run(data, (err) => {
                if(err && err.errno != 19){
                    reject(err)
                }
                else resolve();
            });
        });
    },

    beginTransaction(db){
        return new Promise((resolve, reject) => {
            db.run(`BEGIN TRANSACTION`, (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
    },

    commitTransaction(db){
        return new Promise((resolve, reject) => {
            db.run(`COMMIT TRANSACTION`, (err) => {
                if(err) reject(err);
                else resolve();
            });
        });
    },

    createTables(db){
        return new Promise(async resolve =>{
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS media(
                        media_id TEXT PRIMARY KEY,
                        item_id INT NOT NULL, 
                        item_type INT NOT NULL,
                        title TEXT,
                        year INT, 
                        start_date INT,
                        end_date INT,
                        overview TEXT,
                        vote INT,
                        duration INT NOT NULL,
                        budget INT,
                        revenue INT,
                        content_rating TEXT, 
                        poster TEXT,
                        logo TEXT,
                        backdrop TEXT,
                        path TEXT NOT NULL,
                        studio TEXT
                    )`, (err) => { 
                        if(err){
                            console.error('media Table', err.message); 
                        }
                        else{
                            console.error(`Table 'media' has been created`); 
                        }

                        finish()
                    }
                );

            })
    
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS episodes(
                        episode_id INT PRIMARY KEY, 
                        media_id TEXT NOT NULL,
                        season_num INT NOT NULL,
                        episode_num INT NOT NULL,
                        title TEXT, 
                        air_date INT,
                        overview TEXT,
                        vote INT,
                        duration INT NOT NULL, 
                        still_small TEXT,
                        still_large TEXT,
                        path TEXT NOT NULL
                    )`, (err) => { 
                        if(err){
                            console.error('episodes Table', err.message); 
                        }
                        else{
                            console.error(`Table 'episodes' has been created`); 
                        }
                        finish()
                    }
                );
            });
            
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS genre_relations(
                        key TEXT PRIMARY KEY,
                        media_id TEXT NOT NULL, 
                        genre_id INT NOT NULL
                    )`, (err) => { 
                        if(err){
                            console.error('genre_realtions Table', err.message); 
                        }
                        else{
                            console.error(`Table 'genre_relations' has been created`); 
                        }
                        finish()
                    }
                );
            });

            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS genres(
                        key TEXT PRIMARY KEY,
                        genre_id INT NOT NULL,
                        genre_name TEXT NOT NULL
                    )`, async (err) => { 
                        if(err){
                            console.error('genre_realtions Table', err.message); 
                        }
                        else{
                            const genres = [
                                {id:28, name:'Action'},
                                {id:12, name:'Adventure'},
                                {id:16, name:'Animation'},
                                {id:35, name:'Comedy'},
                                {id:80, name:'Crime'},
                                {id:99, name:'Documentary'},
                                {id:18, name:'Drama'},
                                {id:10751, name:'Family'},
                                {id:14, name:'Fantasy'},
                                {id:36, name:'History'},
                                {id:27, name:'Horror'},
                                {id:10402, name:'Music'},
                                {id:9648, name:'Mystery'},
                                {id:10749, name:'Romance'},
                                {id:878, name:'Sci-Fi'},
                                {id:10770, name:'TV Movie'},
                                {id:53, name:'Thriller'},
                                {id:10752, name:'War'},
                                {id:37, name:'Western'},

                                {id:10759, name:'Action'},
                                {id:10759, name:'Adventure'},
                                {id:16, name:'Animation'},
                                {id:35, name:'Comedy'},
                                {id:80, name:'Crime'},
                                {id:99, name:'Documentary'},
                                {id:18, name:'Drama'},
                                {id:10751, name:'Family'},
                                {id:10762, name:'Kids'},
                                {id:9648, name:'Mystery'},
                                {id:10763, name:'News'},
                                {id:10764, name:'Reality'},
                                {id:10765, name:'Sci-Fi'},
                                {id:10765, name:'Fantasy'},
                                {id:10766, name:'Soap'},
                                {id:10767, name:'Talk'},
                                {id:10768, name:'War'},
                                {id:10768, name:'Politics'},
                                {id:37, name:'Western'}
                            ];

                            const prep = db.prepare(`INSERT INTO genres (key, genre_id, genre_name) VALUES (?, ?, ?)`);

                            for(const genre of genres){
                                await dbManager.insert(prep, [`${genre.id}_${genre.name}`, genre.id, genre.name]);
                            }
                            
                            finish();
                        }
                    }
                );
            });

            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS cast_relations(
                        key TEXT PRIMARY KEY,
                        media_id TEXT NOT NULL, 
                        person_id INT NOT NULL,
                        director INT NOT NULL,
                        character TEXT,
                        credit_order INT
                    )`, (err) => { 
                        if(err){
                            console.error('cast_relations Table', err.message); 
                        }
                        else{
                            console.error(`Table 'cast_relations' has been created`); 
                        }
                        finish();
                    }
                );
            });
            
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS cast(
                        person_id INT PRIMARY KEY,
                        name TEXT NOT NULL,
                        birthday INT,
                        deathday INT,
                        biography TEXT,
                        image TEXT
                    )`, (err) => { 
                        if(err){
                            console.error('cast Table', err.message); 
                        }
                        else{
                            console.error(`Table 'cast' has been created`); 
                        }
                        finish()
                    }
                );
            });
            
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS user_list(
                        user_id TEXT PRIMARY KEY, 
                        user_name TEXT, 
                        user_image TEXT, 
                        child INT NOT NULL
                    )`, (err) => { 
                        if(err){
                            console.error('user_list Table', err.message); 
                        }
                        else{
                            console.log(`Table 'user_list' has been created`); 
                        }
                        finish()
                    }
                );
            });

            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS user_continue(
                        key TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,  
                        media_id TEXT NOT NULL, 
                        percent INT NOT NULL,
                        episode_id INT, 
                        time_stamp INT NOT NULL
                    )`, (err) => { 
                        if(err){ 
                            console.error('user_continue Table', err.message); 
                        } 
                        else{
                            console.log(`Table 'user_continue' has been created`); 
                        }
                        finish()
                    }
                );
            })
            
            await new Promise(finish => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS user_watchlist(
                        key TEXT PRIMARY KEY,
                        media_id TEXT NOT NULL, 
                        user_id TEXT NOT NULL,
                        time_stamp INT NOT NULL
                    )`, (err) => {
                        if(err){
                            console.error('user_watchlist Table', err.message)
                        }
                        else{
                            console.error(`Table 'user_watchlist' has been created`); 
                        }
                        finish();
                    }
                );
            });

            resolve()
        })
    }
}

export default dbManager;