import sqlite3 from 'sqlite3';
sqlite3.verbose()
import env from '../../env.js';
import { scanMovies, scanShows } from './filesUtil.helpers.js';
import { fetchItem, fetchPerson, fetchShow } from './TMDb-api.helpers.js';
import { orphans, haveMedia } from './queries.helpers.js';

let mediaPrep, episodePrep, continuePrep;

const genres = [
    {id:28,    name:'Action'     },
    {id:10759, name:'Action'     },
    {id:12,    name:'Adventure'  },
    {id:10759, name:'Adventure'  },
    {id:16,    name:'Animation'  },
    {id:35,    name:'Comedy'     },
    {id:80,    name:'Crime'      },
    {id:99,    name:'Documentary'},
    {id:18,    name:'Drama'      },
    {id:10751, name:'Family'     },
    {id:14,    name:'Fantasy'    },
    {id:10765, name:'Fantasy'    },
    {id:36,    name:'History'    },
    {id:27,    name:'Horror'     },
    {id:10762, name:'Kids'       },
    {id:10767, name:'Talk'       },
    {id:10402, name:'Music'      },
    {id:9648,  name:'Mystery'    },
    {id:10763, name:'News'       },
    {id:10768, name:'Politics'   },
    {id:10764, name:'Reality'    },
    {id:10749, name:'Romance'    },
    {id:878,   name:'Sci-Fi'     },
    {id:10765, name:'Sci-Fi'     },
    {id:10766, name:'Soap'       },
    {id:10770, name:'TV Movie'   },
    {id:53,    name:'Thriller'   },
    {id:10752, name:'War'        },
    {id:10768, name:'War'        },
    {id:37,    name:'Western'    }
];

const db = new sqlite3.Database(env.databasePath, sqlite3.OPEN_READWRITE, async err => {
    if(err) console.error(err.message);
    else {
        await foreignKeys();
        await createTables();
        mediaPrep = {
            main: db.prepare(`INSERT INTO media_main (MEDIA_ID, TMDB_ID, IMDB_ID, TYPE, PATH) VALUES (?,?,?,?,?)`),
            images: db.prepare(`INSERT INTO media_images (MEDIA_ID, POSTER_S, POSTER_L, POSTER_NT_S, POSTER_NT_L, POSTER_W_S, POSTER_W_L, LOGO_S, LOGO_L, BACKDROP_S, BACKDROP_L) VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
            dates: db.prepare(`INSERT INTO media_dates (MEDIA_ID, YEAR, START_DATE, END_DATE) VALUES (?,?,?,?)`),
            finances: db.prepare(`INSERT INTO media_finances (MEDIA_ID, BUDGET, REVENUE) VALUES (?,?,?)`),
            companies: db.prepare(`INSERT INTO media_companies (KEY, MEDIA_ID, COMPANY_NAME) VALUES (?,?,?)`),
            info: db.prepare(`INSERT INTO media_info (MEDIA_ID, TITLE, OVERVIEW, CONTENT_RATING, DURATION, VOTE) VALUES (?,?,?,?,?,?)`),
            genres: db.prepare(`INSERT INTO media_genres (KEY, MEDIA_ID, GENRE_ID) VALUES (?,?,?)`),
            cast: db.prepare(`INSERT INTO cast (KEY, MEDIA_ID, PERSON_ID, CHARACTER, CAST_ORDER) VALUES (?,?,?,?,?)`)
        };
        episodePrep = {
            main: db.prepare(`INSERT INTO episodes_main (EPISODE_ID, IMDB_ID, MEDIA_ID, SEASON_NUM, EPISODE_NUM, PATH) VALUES (?,?,?,?,?,?)`),
            images: db.prepare(`INSERT INTO episodes_images(EPISODE_ID, STILL_S, STILL_L) VALUES (?,?,?)`),
            dates: db.prepare(`INSERT INTO episodes_dates (EPISODE_ID, YEAR, AIR_DATE) VALUES (?,?,?)`),
            info: db.prepare(`INSERT INTO episodes_info (EPISODE_ID, TITLE, OVERVIEW, DURATION, VOTE) VALUES (?,?,?,?,?)`)
        },
        continuePrep = {
            insert: db.prepare(`INSERT INTO users_continue (KEY, USER_ID, MEDIA_ID, EPISODE_ID, PROGRESS_TIME, END_TIME, TIME_STAMP) VALUES (?,?,?,?,?,?,?)`),
            update: db.prepare(`UPDATE users_continue SET PROGRESS_TIME = ?, END_TIME = ?, TIME_STAMP = ? WHERE KEY = ?`)
        }
    }
});

const transaction = {
    begin: () => new Promise((res, rej) => db.run(`BEGIN TRANSACTION`, err => err ? rej(err) : res())),
    commit: () => new Promise((res, rej) => db.run(`COMMIT TRANSACTION`, err => err ? rej(err) : res())) 
};

const foreignKeys = () => new Promise(async res => db.run(
    'PRAGMA foreign_keys = ON',
    (err) => {
        if(err) console.error(err.message);
        res();
    }
));

const createTables = () => new Promise(async res => {
    // Media Main
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_main (
            MEDIA_ID TEXT PRIMARY KEY,
            TMDB_ID INT NOT NULL,
            IMDB_ID TEXT NOT NULL,
            TYPE INT NOT NULL,
            PATH TEXT NOT NULL
        )`, err => err ? console.error('Media Main', err.message) : res())
    );
    
    // Media Images
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_images (
            MEDIA_ID TEXT PRIMARY KEY,
            POSTER_S TEXT,
            POSTER_L TEXT,
            POSTER_NT_S TEXT,
            POSTER_NT_L TEXT,
            POSTER_W_S TEXT,
            POSTER_W_L TEXT,
            LOGO_S TEXT,
            LOGO_L TEXT,
            BACKDROP_S TEXT,
            BACKDROP_L TEXT,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Images', err.message) : res())
    );
    
    // Media Dates
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_dates (
            MEDIA_ID TEXT PRIMARY KEY,
            YEAR INT NOT NULL,
            START_DATE TEXT NOT NULL,
            END_DATE TEXT NOT NULL,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Dates', err.message) : res())
    );
    
    // Media Finances
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_finances (
            MEDIA_ID TEXT PRIMARY KEY,
            BUDGET INT,
            REVENUE INT,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Finances', err.message) : res())
    );
    
    // Media Companies
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_companies (
            KEY TEXT PRIMARY KEY,
            MEDIA_ID TEXT NOT NULL,
            COMPANY_NAME TEXT NOT NULL,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Info', err.message) : res())
    );
    
    // Media Info
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_info (
            MEDIA_ID TEXT PRIMARY KEY,
            TITLE TEXT NOT NULL,
            OVERVIEW TEXT,
            CONTENT_RATING TEXT,
            DURATION REAL,
            VOTE REAL,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Info', err.message) : res())
    );
    
    // Episodes Main
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS episodes_main (
            EPISODE_ID INT PRIMARY KEY,
            IMDB_ID TEXT NOT NULL,
            MEDIA_ID TEXT NOT NULL,
            SEASON_NUM INT NOT NULL,
            EPISODE_NUM INT NOT NULL,
            PATH TEXT NOT NULL,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Episodes Main', err.message) : res())
    );
    
    // Episodes Images
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS episodes_images (
            EPISODE_ID INT PRIMARY KEY,
            STILL_S TEXT,
            STILL_L TEXT,
            FOREIGN KEY(EPISODE_ID) REFERENCES episodes_main(EPISODE_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Episodes Images', err.message) : res())
    );
    
    // Episodes Dates
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS episodes_dates (
            EPISODE_ID INT PRIMARY KEY,
            YEAR INT,
            AIR_DATE TEXT,
            FOREIGN KEY(EPISODE_ID) REFERENCES episodes_main(EPISODE_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Episodes Dates', err.message) : res())
    );
    
    // Episodes Info
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS episodes_info (
            EPISODE_ID INT PRIMARY KEY,
            TITLE TEXT NOT NULL,
            OVERVIEW TEXT,
            DURATION REAL NOT NULL,
            VOTE REAL,
            FOREIGN KEY(EPISODE_ID) REFERENCES episodes_main(EPISODE_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Episodes Info', err.message) : res())
    );
    
    // Genres
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS genres (
            KEY TEXT PRIMARY KEY, 
            GENRE_ID INT NOT NULL, 
            GENRE_NAME TEXT NOT NULL
        )`, 
        err => {
            if(err) console.error(err.message);
            else{
                const prep = db.prepare(`INSERT INTO genres (KEY, GENRE_ID, GENRE_NAME) VALUES (?,?,?)`);
                for(const genre of genres){
                    prep.run([`${genre.id}_${genre.name}`, genre.id, genre.name], err => err ? {} : {});
                };
                res();
            };
        }
    ));
    
    // Media Genres
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS media_genres (
            KEY TEXT PRIMARY KEY,
            MEDIA_ID TEXT NOT NULL,
            GENRE_ID INT NOT NULL,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('Media Genres', err.message) : res())
    );
    
    // People
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS people (
            PERSON_ID INT PRIMARY KEY,
            NAME TEXT,
            BIRTH_DATE TEXT,
            DEATH_DATE TEXT,
            BIOGRAPHY TEXT,
            PROFILE_IMAGE TEXT
        )`, err => err ? console.error('People', err.message) : res())
    );
    
    // Cast
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS cast (
            KEY TEXT PRIMARY KEY,
            MEDIA_ID TEXT NOT NULL,
            PERSON_ID INT NOT NULL,
            CHARACTER TEXT,
            CAST_ORDER INT
        )`, err => err ? console.error('Cast', err.message) : res())
    );
    
    // User List
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS users_main (
            USER_ID TEXT PRIMARY KEY, 
            USER_NAME TEXT NOT NULL,
            USER_IMAGE TEXT,
            CHILD INT NOT NULL,
            ADMIN INT NOT NULL,
            USER_PIN INT 
        )`, err => err ? console.error('User List', err.message) : res())
    );
    
    // User Continue
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS users_continue(
            KEY TEXT PRIMARY KEY,
            USER_ID TEXT NOT NULL, 
            MEDIA_ID TEXT NOT NULL, 
            EPISODE_ID INT,
            PROGRESS_TIME REAL NOT NULL,
            END_TIME REAL NOT NULL,
            TIME_STAMP TEXT NOT NULL,
            FOREIGN KEY(USER_ID) REFERENCES users_main(USER_ID) ON DELETE CASCADE
        )`, err => err ? console.error('User Continue', err.message) : res())
    );
    
    // User Watchlist
    await new Promise(res => 
        db.run(`CREATE TABLE IF NOT EXISTS users_watchlist(
            KEY TEXT PRIMARY KEY,
            USER_ID TEXT NOT NULL, 
            MEDIA_ID TEXT NOT NULL, 
            TIME_STAMP TEXT NOT NULL,
            FOREIGN KEY(USER_ID) REFERENCES users_main(USER_ID) ON DELETE CASCADE,
            FOREIGN KEY(MEDIA_ID) REFERENCES media_main(MEDIA_ID) ON DELETE CASCADE
        )`, err => err ? console.error('User Watchlist', err.message) : res())
    );

    // Subtitles
    await new Promise(res => 
        db.run(
            `CREATE TABLE IF NOT EXISTS subtitles (
                PATH TEXT PRIMARY KEY NOT NULL,
                MEDIA_ID TEXT,
                EPISODE_ID INT,
                LANG TEXT NOT NULL,
                EXT TEXT NOT NULL
            )`,
            err => err ? console.error('User Watchlist', err.message) : res()
        )
    );

    res();
});

const insertMedia = (m) => new Promise(async (res, rej) => {
    try{
        const 
        main_data = [m.media_id, m.tmdb_id, m.imdb_id, m.type, m.path],
        images_data = [m.media_id, m.poster_s, m.poster_l, m.poster_nt_s, m.poster_nt_l, m.poster_w_s, m.poster_w_l,  m.logo_s, m.logo_l, m.backdrop_s, m.backdrop_l],
        dates_data = [m.media_id, m.year, m.start_date, m.end_date],
        finances_data = [m.media_id, m.budget, m.revenue],
        info_data = [m.media_id, m.title, m.overview, m.content_rating, m.duration, m.vote];
    
        await new Promise(res => mediaPrep.main.run(main_data, err => {if(err) console.error('media main', err.message); res()}));
        await new Promise(res => mediaPrep.images.run(images_data, err => {if(err) console.error('media images',err.message); res()}));
        await new Promise(res => mediaPrep.dates.run(dates_data, err => {if(err) console.error('media dates',err.message); res()}));
        await new Promise(res => mediaPrep.finances.run(finances_data, err => {if(err) console.error('media finances',err.message); res()}));
        await new Promise(res => mediaPrep.info.run(info_data, err => {if(err) console.error('media info',err.message); res()}));
    
        for(const genre of m.genres){
            await new Promise(res => mediaPrep.genres.run([`KEY_${m.media_id}_${genre}`, m.media_id, genre], err => {res()}));
        };
    
        for(const company of m.companies){
            await new Promise(res => mediaPrep.companies.run([`KEY_${m.media_id}_${company}`, m.media_id, company], err => {res()}));
        };
    
        for(const person of m.credits){
            await new Promise(res => mediaPrep.cast.run([`KEY_${m.media_id}_${person.id}_${person.character}`, m.media_id, person.id, person.character, person.order], err => {res()}));
        };
        res();
    }
    catch(err) {
        rej(err);
    }
});

const insertEpisode = (media_id, e) => new Promise(async (res, rej) => {
    const 
    main_data = [e.episode_id, e.imdb_id, media_id, e.season_num, e.episode_num, e.path],
    images_data = [e.episode_id, e.still_s, e.still_l],
    dates_data = [e.episode_id, e.year, e.air_date],
    info_data = [e.episode_id, e.title, e.overview, e.duration, e.vote];

    await new Promise(res => episodePrep.main.run(main_data, err => {if(err) console.error('episode main', err.message); res()}));
    await new Promise(res => episodePrep.images.run(images_data, err => {if(err) console.error('episode images', err.message); res()}));
    await new Promise(res => episodePrep.dates.run(dates_data, err => {if(err) console.error('episode dates', err.message); res()}));
    await new Promise(res => episodePrep.info.run(info_data, err => {if(err) console.error('episode info', err.message); res()}));

    res();
});

const insertShow = (show) => new Promise(async (res, rej) => {
    try {
        const have = await haveMedia(show.path);

        await transaction.begin();
        if(!have) {
            await insertMedia(show);
        }
    
        for(const episode of show.episodes) {
            await insertEpisode(show.media_id, episode);
        }

        await transaction.commit();

        res();
    }
    catch(err) {
        rej(err.message);
    }
});

const insertPerson = (data) => new Promise(async (res, rej) => {
    const prep = db.prepare(`INSERT INTO people (PERSON_ID, NAME, BIRTH_DATE, DEATH_DATE, BIOGRAPHY, PROFILE_IMAGE) VALUES (?,?,?,?,?,?)`);
    await new Promise(res => prep.run([data.person_id, data.name, data.birth_date, data.death_date, data.biography, data.profile_image], err => {if(err) console.error(err.message); res()}));
    res();
});

const setPoster = (mediaId, large, small) => new Promise(async (res, rej) => db.run(
    `UPDATE media_images
    SET POSTER_L = ?, POSTER_S = ?
    WHERE MEDIA_ID = ?`,
    [large, small, mediaId],
    (err) => err ? rej() : res()
));

const setPosterNt = (mediaId, large, small) => new Promise(async (res, rej) => db.run(
    `UPDATE media_images
    SET POSTER_NT_L = ?, POSTER_NT_S = ?
    WHERE MEDIA_ID = ?`,
    [large, small, mediaId],
    (err) => err ? rej() : res()
));

const setPosterWide = (mediaId, large, small) => new Promise(async (res, rej) => db.run(
    `UPDATE media_images
    SET POSTER_W_L = ?, POSTER_W_S = ?
    WHERE MEDIA_ID = ?`,
    [large, small, mediaId],
    (err) => err ? rej() : res()
));

const setBackdrop = (mediaId, large, small) => new Promise(async (res, rej) => db.run(
    `UPDATE media_images
    SET BACKDROP_L = ?, BACKDROP_S = ?
    WHERE MEDIA_ID = ?`,
    [large, small, mediaId],
    (err) => err ? rej() : res()
));

const setLogo = (mediaId, large, small) => new Promise(async (res, rej) => db.run(
    `UPDATE media_images
    SET LOGO_L = ?, LOGO_S = ?
    WHERE MEDIA_ID = ?`,
    [large, small, mediaId],
    (err) => err ? rej() : res()
));

const manager = {
    status: {
        ACTIVE: false,
        ACTION: null,
        PROGRESS: null,
    },

    run: (action) => new Promise( async (res, rej) => {
        try{
            if(manager.status.ACTIVE) throw new Error('Already Active');
            manager.status.ACTIVE = true;
            manager.status.PROGRESS = 0;
            
            if(action == 1){
                const movies = await scanMovies();

                manager.status.ACTION = 'Insert Movies';
                manager.status.PROGRESS = 0;
                let i = 0;

                for(const movie of movies) {
                    i++
                    manager.status.PROGRESS = (100 / movies.length) * i;
                    manager.status.ACTION = `Insert Movies - ${movie.title} [${movie.year}]`;

                    try {
                        const data = await fetchItem(1, movie);
                        await insertMedia(data);
                    }
                    catch(err) {
                        console.error(err.message);
                    }

                };

                res();
            }
            else if(action == 2){
                const shows = await scanShows();

                manager.status.ACTION = 'Insert Shows';
                manager.status.PROGRESS = 0;
                let i = 0;

                
                for(const show of shows) {
                    
                    i++
                    manager.status.PROGRESS = (100 / shows.length) * i;
                    manager.status.ACTION = `Insert Shows - ${show.title} [${show.year}]`;

                    try {
                        const data = await fetchShow(show);
                        await insertShow(data);
                    }
                    catch(err) {
                        console.error(err.message);
                    }
                }
                res();
            }
            else if(action == 3){
                manager.status.ACTION = 'Scanning people';
                const ids = await orphans();
                
                manager.status.ACTION = 'Updating people';
                manager.status.PROGRESS = 0;
                let i = 0;

                for(const id of ids) {
                    i++;
                    manager.status.PROGRESS = (100 / ids.length) * i;
                    
                    try {
                        const data = await fetchPerson(id);
                        manager.status.ACTION = `Updating people - ${data.name}`;
                        insertPerson(data);
                    }
                    catch(err) {
                        console.error(err.message);
                    }
                }

                res();
            }
            else throw new Error('Unknown Action');
        }
        catch(err){
            console.error(err.message);
        }
        manager.status.ACTIVE = false;
        manager.status.ACTION = null;
        manager.status.PROGRESS = null;
    })
};

export { 
    db, 
    manager, 
    continuePrep, 
    setPoster,
    setPosterNt,
    setPosterWide,
    setBackdrop,
    setLogo
};