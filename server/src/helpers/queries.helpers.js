import { db } from './database.helpers.js';

const browseGenres = (limit) => new Promise( async (res, rej) => {
    try{
        const 
        query_1 = (id) => new Promise((res, rej) => db.all(`${main_q} WHERE GENRE_ID = ? ${order_limit_q}`, [id, limit], (err, rows) => err ? rej(err) : res(rows))),
        query_2 = (id1, id2) => new Promise((res, rej) => db.all(`${main_q} WHERE (GENRE_ID = ? OR GENRE_ID = ?) ${order_limit_q}`, [id1, id2, limit], (err, rows) => err ? rej(err) : res(rows))),

        main_q = `
            SELECT 
                i.*, 
                d.YEAR,
                m.*
            FROM media_genres AS g 
            JOIN media_info AS i ON i.MEDIA_ID = g.MEDIA_ID 
            JOIN media_dates AS d ON d.MEDIA_ID = g.MEDIA_ID 
            JOIN media_images AS m ON m.MEDIA_ID = g.MEDIA_ID 
        `,
        order_limit_q = `ORDER BY RANDOM() LIMIT ?`,
        
        data = [
            {genre: 'action', data: await query_2(28, 10759)},
            {genre: 'adventure', data: await query_2(12, 10759)},
            {genre: 'animation', data: await query_1(16)},
            {genre: 'comedy', data: await query_1(35)},
            {genre: 'crime', data: await query_1(80)},
            {genre: 'documentary', data: await query_1(99)},
            {genre: 'drama', data: await query_1(18)},
            {genre: 'family', data: await query_1(10751)},
            {genre: 'fantasy', data: await query_2(14, 10765)},
            {genre: 'history', data: await query_1(36)},
            {genre: 'horror', data: await query_1(27)},
            {genre: 'kids', data: await query_1(10762)},
            {genre: 'talk', data: await query_1(10767)},
            {genre: 'music', data: await query_1(10402)},
            {genre: 'mystery', data: await query_1(9648)},
            {genre: 'news', data: await query_1(10763)},
            {genre: 'politics', data: await query_1(10768)},
            {genre: 'reality', data: await query_1(10764)},
            {genre: 'romance', data: await query_1(10749)},
            {genre: 'sci-fi', data: await query_2(878, 10765),},
            {genre: 'soap', data: await query_1(10766)},
            {genre: 'tv movies', data: await query_1(10770)},
            {genre: 'thrillers', data: await query_1(53)},
            {genre: 'war', data: await query_2(10752, 10768)},
            {genre: 'western', data: await query_1(37)},
        ];

        res(data);
    }
    catch(err){
        rej(err)
    }
});

const orphans = () => new Promise((res, rej) => db.all(`
        SELECT DISTINCT PERSON_ID 
        FROM cast 
        WHERE PERSON_ID NOT IN (SELECT PERSON_ID FROM people)
    `, (err, rows) => err ? rej(err) : res(rows.map(i => i.PERSON_ID))
));

const haveMedia = (path) => new Promise((res, rej) => db.get(`SELECT * FROM media_main WHERE PATH = ?`, [path], (err, row) => err ? rej(err) : row ? res(true) : res(false))); 

const userList = () => new Promise((res, rej) => db.all(`SELECT * FROM users_main`, (err, rows) => err ? rej(err) : res(rows))); 

const mediaInfo = (mediaId) => new Promise((res, rej) => db.get(
    `SELECT info.*, images.*, dates.*, main.TYPE
    FROM media_info AS info
    JOIN media_images AS images ON info.MEDIA_ID = images.MEDIA_ID
    JOIN media_dates AS dates ON info.MEDIA_ID = dates.MEDIA_ID
    JOIN media_main AS main ON info.MEDIA_ID = main.MEDIA_ID
    WHERE info.MEDIA_ID = ?`,
    [mediaId],
    (err, row) => err ? rej(err) : res(row)
));

const mediaGenres = (mediaId) => new Promise((res, rej) => db.all(
    `SELECT  g.GENRE_NAME
    FROM media_genres AS m
    JOIN genres AS g ON g.GENRE_ID = m.GENRE_ID
    WHERE m.MEDIA_ID = ?`,
    [mediaId],
    (err, rows) => err ? rej(err) : res(rows)
));

const mediaCast = (mediaId) => new Promise((res, rej) => db.all(
    `SELECT p.PERSON_ID, c.CHARACTER, p.NAME, p.PROFILE_IMAGE
    FROM cast AS c
    JOIN people AS p ON c.PERSON_ID = p.PERSON_ID
    WHERE c.MEDIA_ID = ?
    ORDER BY c.CAST_ORDER ASC`,
    [mediaId],
    (err, rows) => err ? rej(err) : res(rows)
));

const mediaSeason = (mediaId, seasonNum, userId) => new Promise((res, rej) => db.all(
    `SELECT m.MEDIA_ID, m.SEASON_NUM, m.EPISODE_NUM, i.*, d.*, f.*, c.PROGRESS_TIME
    FROM episodes_main AS m
    JOIN episodes_images AS i ON i.EPISODE_ID = m.EPISODE_ID
    JOIN episodes_dates AS d ON d.EPISODE_ID = m.EPISODE_ID
    JOIN episodes_info AS f ON f.EPISODE_ID = m.EPISODE_ID
    LEFT JOIN users_continue AS c ON c.EPISODE_ID = m.EPISODE_ID AND c.USER_ID = ?
    WHERE m.MEDIA_ID = ? AND m.SEASON_NUM = ?`,
    [userId, mediaId, seasonNum],
    (err, rows) => err ? rej(err) : res(rows)
)); 

const availableSeasons = (mediaId) => new Promise((res, rej) => db.all(`SELECT DISTINCT SEASON_NUM FROM episodes_main WHERE MEDIA_ID = ? ORDER BY SEASON_NUM ASC`, [mediaId], (err, rows) => err ? rej(err) : res(rows)));

const mediaEpisodeInfo = (episodeId) => new Promise((res, rej) => db.get(
    `SELECT i.*, m.MEDIA_ID, m.SEASON_NUM, m.EPISODE_NUM, x.TYPE
    FROM episodes_info AS i 
    JOIN episodes_main AS m ON i.EPISODE_ID = m.EPISODE_ID
    JOIN media_main AS x ON m.MEDIA_ID = x.MEDIA_ID 
    WHERE i.EPISODE_ID = ?`, 
    [episodeId], 
    (err, row) => err ? rej(err) : res(row)
));

const nextEpisode = (mediaId, seasonNum, episodeNum) => new Promise((res, rej) => db.get(
    `SELECT i.*, m.MEDIA_ID, m.SEASON_NUM, m.EPISODE_NUM, x.TYPE
    FROM episodes_main AS m
    JOIN episodes_info AS i ON m.EPISODE_ID = i.EPISODE_ID
    JOIN media_main AS x ON m.MEDIA_ID = x.MEDIA_ID 
    WHERE m.MEDIA_ID = ? AND (SEASON_NUM > ? OR (SEASON_NUM = ? AND EPISODE_NUM > ?))
    ORDER BY m.SEASON_NUM ASC, m.EPISODE_NUM ASC`,
    [mediaId, seasonNum, seasonNum, episodeNum],
    (err, row) => err ? rej(err) : res(row)
));

const searchMedia = (value) => new Promise((res, rej) => db.all(
    `SELECT * 
    FROM media_info AS info
    JOIN media_images AS images ON images.MEDIA_ID = info.MEDIA_ID
    JOIN media_dates AS dates ON dates.MEDIA_ID = info.MEDIA_ID
    WHERE info.TITLE LIKE '%' || ? || '%'`,
    [value],
    (err, rows) => err ? rej(err) : res(rows)
));

export { browseGenres, orphans, haveMedia, userList, mediaInfo, mediaGenres, mediaCast, mediaSeason, availableSeasons, mediaEpisodeInfo, nextEpisode, searchMedia };