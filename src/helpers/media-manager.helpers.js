import fs from 'fs';
import db from './database-pool.helpers.js';
import TMDb from './TMDb-api.helpers.js';
import filesUtil from './filesUtil.helpers.js';
import dbManger from '../helpers/database-manager.helpers.js';
import dataSearch from './data-search.helpers.js';

const mediaManager = {
    BUSY: false,
    PROGRESS: null,
    ACTION: null,
    UPDATE: null,

    prepare: {
        media(){
            return db.prepare(`
                INSERT INTO media (media_id, item_id, item_type, title, year, start_date, end_date, overview, vote, duration, budget, revenue, content_rating, poster, logo, backdrop, path, studio) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
        },

        episode(){ 
            return db.prepare(`
                INSERT INTO episodes (episode_id , media_id, season_num, episode_num, title, air_date, overview, vote, duration, still_small, still_large, path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            );
        },

        genreRelations(){
            return db.prepare(`
                INSERT INTO genre_relations (key, media_id, genre_id)
                VALUES (?, ?, ?)`
            );
        },

        castRelations(){
            return db.prepare(`
                INSERT INTO cast_relations (key, media_id, person_id, director, character, credit_order)
                VALUES (?, ?, ?, ?, ?, ?)`
            );
        },

        cast(){
            return db.prepare(`
                INSERT INTO cast (person_id, name, birthday, deathday, biography, image)
                VALUES (?, ?, ?, ?, ?, ?)`
            );
        }
    },

    async addShows(){
        // Start Update If Media Manager Is Not Busy
        if(this.BUSY) return;
        this.BUSY = true;
        this.PROGRESS = 0;
        this.ACTION = 'addShows';
        this.UPDATE = 'Starting addShows';

        await dbManger.beginTransaction(db);

        // Loop Through Valid Folders
        const showFolders = filesUtil.validShows();
        const fPer = (100/(showFolders.length));
        for(const [s_index, show] of showFolders.entries()){
            this.UPDATE = `Scanning ${show.info.title} [${show.info.year}]`;

            try{
                // Get Show Data
                const showData = await TMDb.showData(show.path, show.info.title, show.info.year);
                dbManger.insert(this.prepare.media(), showData.array);
                for(const genre of showData.res.genres){
                    await dbManger.insert(this.prepare.genreRelations(), [showData.array[0]+'_'+genre.id, showData.array[0], genre.id]);
                }
                const credits = await TMDb.agregateTvCredits(showData.res.id);
                for(const credit of credits){
                    await dbManger.insert(this.prepare.castRelations(), credit)
                }
    
                // Loop Through Episodes
                const episodes = await filesUtil.validEpisodeFiles(show.path);
                const ePer = (fPer/(episodes.length));
                for(const [e_index, episode] of episodes.entries()){
                    this.PROGRESS = parseFloat(((fPer*s_index) + (ePer*(e_index+1))).toFixed(2));

                    const exists = await new Promise(resolve => {
                        db.get(`SELECT * FROM episodes WHERE path = ?`, [episode.path], (err, row) => {
                            if(err) console.log(err);
                            resolve(row != undefined);
                        })
                    })

                    if(exists) continue;

                    const episodeData = await TMDb.episodeData(episode.path, showData.array[0], showData.array[1], episode.season_num, episode.episode_num, episode.duration);
                    // Insert Episodes If Not In Database
                    await dbManger.insert(this.prepare.episode(), episodeData.array);
                }
            }
            catch(err){
                continue;
            }
        }

        await dbManger.commitTransaction(db);

        this.UPDATE = 'Finished addShows';
        this.BUSY = false;
        this.PROGRESS = null;
        this.ACTION = null;
    },

    async addMovies(){
        // Start Update If Media Manager Is Not Busy
        if(this.BUSY) return;
        this.BUSY = true;
        this.PROGRESS = 0;
        this.ACTION = 'addMovies';
        this.UPDATE = 'Starting addMovies';

        await dbManger.beginTransaction(db);

        // Loop Through Valid Files
        const movieFiles = filesUtil.validMovies();
        const fPer = (100/(movieFiles.length));
        for(const [index, movie] of movieFiles.entries()){
            this.PROGRESS = fPer * (index + 1)
            this.UPDATE = `Scanning ${movie.info.title} [${movie.info.year}]`;

            try{
                // Get Movie Data
                const movieData = await TMDb.movieData(movie.path, movie.info.title, movie.info.year);
    
                dbManger.insert(this.prepare.media(), movieData.array);
    
                // Loop Through Genres
                for(const genre of movieData.res.genres){
                    await dbManger.insert(this.prepare.genreRelations(), [movieData.array[0]+'_'+genre.id, movieData.array[0], genre.id])
                }
    
                // Loop Through Cast
                const credits = await TMDb.movieCredits(movieData.res.id);
                for(const credit of credits){
                    await dbManger.insert(this.prepare.castRelations(), credit)
                }
            }
            catch(err){
                continue;
            }
        }

        await dbManger.commitTransaction(db);

        this.UPDATE = 'Finished addMovies';
        this.BUSY = false;
        this.PROGRESS = null;
        this.ACTION = null;
    },

    async resetMedia(){
        if(this.BUSY) return;
        this.BUSY = true;
        this.PROGRESS = 0;
        this.ACTION = 'resetMedia';
        this.UPDATE = 'Starting Reset';

        await dbManger.beginTransaction(db);

        await new Promise(async finish => {
            const tables = ['media', 'episodes', 'genre_relations', 'genres', 'cast', 'cast_relations'];
            for(const table of tables){
                await new Promise(finish => {
                    db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
                        if (err) {
                            console.error(err.message);
                        } 
                        else {
                            console.log(`Table '${table}' has been deleted.`);
                        }
                        finish()
                    });
                })
            }
            
            finish()
        })

        this.UPDATE = 'Rebuilding';
        this.PROGRESS = 50;
        await dbManger.createTables(db);

        await dbManger.commitTransaction(db);

        this.UPDATE = 'Finished reset';
        this.BUSY = false;
        this.PROGRESS = null;
        this.ACTION = null;
    },

    async addCredits(){
        if(this.BUSY) return;
        this.BUSY = true;
        this.PROGRESS = 0;
        this.ACTION = 'addCredits';
        this.UPDATE = 'Scanning Credit';

        const credit_ids = await dataSearch.distinctPeople();
        await dbManger.beginTransaction(db);

        const per = 100/credit_ids.length; 
        for(const [index, credit_id] of credit_ids.entries()){
            this.PROGRESS = per * (index + 1);
            if(await dataSearch.person(credit_id) != undefined) continue;
            const data = await TMDb.getPerson(credit_id);
            this.UPDATE = data.res.name;
            try{
                await dbManger.insert(this.prepare.cast(), data.array);
            }
            catch(err){
                console.error(err.message)
            }
        }

        await dbManger.commitTransaction(db);

        this.UPDATE = 'Finished addCredits';
        this.BUSY = false;
        this.PROGRESS = null;
        this.ACTION = null;
    },

    async clean(){
        if(this.BUSY) return;
        this.BUSY = true;
        this.PROGRESS = 0;
        this.ACTION = 'cleam';
        this.UPDATE = 'Cleaning Database';

        await new Promise((resolve) => {
            db.all(`SELECT path, title FROM media`, async (err, rows) => {
                if(err) console.error(err.message);
                const prep = db.prepare(`DELETE FROM media WHERE path = ?`);
                const per = 50 / rows.length;
                let i = 0;
                for(const row of rows){
                    i++;
                    this.PROGRESS = per * i;
                    await new Promise(finish => {
                        fs.access(row.path, fs.constants.F_OK, async (err) => {
                            if(err){
                                await dbManger.insert(prep, [row.path]);
                                this.UPDATE = 'Deleted Media ' + row.title;
                            }
                            finish()
                        });
                    })
                }
                resolve()
            });
        });

        await new Promise((resolve) => {
            db.all(`SELECT path, title FROM episodes`, async (err, rows) => {
                if(err) console.error(err.message);
                const prep = db.prepare(`DELETE FROM episodes WHERE path = ?`);
                const per = 50 / rows.length;
                let i = 0;
                for(const row of rows){
                    i++;
                    this.PROGRESS = 50 + (per * i);
                    await new Promise(finish => {
                        fs.access(row.path, fs.constants.F_OK, async (err) => {
                            if(err){
                                await dbManger.insert(prep, [row.path]);
                                this.UPDATE = 'Deleted Episode ' + row.title;
                            }
                            finish()
                        });
                    })
                }
                resolve()
            });
        });

        this.UPDATE = 'Finished Clean';
        this.BUSY = false;
        this.PROGRESS = null;
        this.ACTION = null;
    }
}

export default mediaManager;