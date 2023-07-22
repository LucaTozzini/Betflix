import { db, continuePrep } from "./database.helpers.js";
import { nextEpisode } from "./search.helpers.js";
import uniqid from 'uniqid';

const addUser = (userName, userImage, childAccount) => new Promise( async (res, rej) => {
    try{
        const userId = uniqid('user-');
        await new Promise((res, rej) => db.run(
            `INSERT INTO users_main (USER_ID, USER_NAME, USER_IMAGE, CHILD, ADMIN) VALUES (?,?,?,?, 0)`, 
            [userId, userName, userImage, childAccount],
            err => err ? rej(err) : res()
        ));
        res();
    }
    catch(err){
        rej(err);
    }
});

const authenticateUser = (userId, userPin) => new Promise((res, rej) => db.get(`SELECT * FROM users_main WHERE USER_ID = ?`, [userId], (err, row) => {
    if(err) return rej(err);
    try{
        if(row == undefined) return res(false);
        if(!row.ADMIN) return res(true);
        res(false);
    }
    catch(err){
        rej(err);
    }
}));

const userData = (userId) => new Promise((res, rej) => db.get(`SELECT USER_NAME, USER_IMAGE FROM users_main WHERE USER_ID = ?`, [userId], (err, row) => err ? rej(err) : res(row)));

const inWatchlist = (userId, mediaId) => new Promise((res, rej) => db.get(`SELECT KEY FROM users_watchlist WHERE USER_ID = ? AND MEDIA_ID = ?`, [userId, mediaId], (err, row) => err ? rej(err) : res(row != undefined)));

const addWatchlist = (userId, mediaId) => new Promise(async(res, rej) => {
    if(await inWatchlist(userId, mediaId)) return res();
    const key = `${userId}_${mediaId}`;
    const timeStamp = new Date().toISOString();
    db.run(
        `INSERT INTO users_watchlist(KEY, USER_ID, MEDIA_ID, TIME_STAMP) VALUES (?,?,?,?)`, 
        [key, userId, mediaId, timeStamp], 
        err => err ? rej(err) : res()
    );
}); 

const removeWatchlist = (userId, mediaId) => new Promise((res, rej) => db.run(`DELETE FROM users_watchlist WHERE USER_ID = ? AND MEDIA_ID = ?`, [userId, mediaId], err => err ? rej(err) : res())); 

const watchlist = (userId) => new Promise((res, rej) => db.all(
    `SELECT i.*, m.*, d.YEAR, 1 AS IN_WATCHLIST
    FROM users_watchlist AS w
    JOIN media_info AS i ON i.MEDIA_ID = w.MEDIA_ID
    JOIN media_images AS m ON m.MEDIA_ID = w.MEDIA_ID
    JOIN media_dates AS d ON d.MEDIA_ID = w.MEDIA_ID
    WHERE w.USER_ID = ?
    ORDER BY w.TIME_STAMP DESC`,
    [userId],
    (err, rows) => err ? rej(err) : res(rows)
));

const mediaContinue = (userId, mediaId) => new Promise((res, rej) => db.all(
    `SELECT *, CASE WHEN END_TIME < 180 THEN 1 ELSE 0 END AS DONE_WATCHING
    FROM users_continue AS c
    LEFT JOIN episodes_main AS m ON c.EPISODE_ID = m.EPISODE_ID 
    WHERE USER_ID = ? AND c.MEDIA_ID = ?
    ORDER BY TIME_STAMP DESC`,
    [userId, mediaId],
    (err, rows) => err ? rej(err) : res(rows)
));

const currentEpisode = (userId, mediaId) => new Promise( async (res, rej) => {
    try{
        const data = await mediaContinue(userId, mediaId);
        const done = [], notDone = [];
        data.forEach(i => i.DONE_WATCHING == 1 ? done.push(i) : notDone.push(i));
        if(notDone.length != 0) res(notDone[0]);
        else {
            const last = done.sort((a,b) => {
                if(a.SEASON_NUM < b.SEASON_NUM) return -1;
                if(a.SEASON_NUM > b.SEASON_NUM) return 1;
                if(a.EPISODE_NUM < b.EPISODE_NUM) return -1;
                if(a.EPISODE_NUM > b.EPISODE_NUM) return 1;
                else return 0;
            })[0];
            const next = await nextEpisode(mediaId, last ? last.SEASON_NUM : 0, last ? last.EPISODE_NUM : 0);
            res(next);
        }
    }
    catch(err){
        rej(err);
    }
});

const hasContinue = (userId, mediaId, episodeId) => new Promise((res, rej) => db.get(`SELECT * FROM users_continue WHERE USER_ID = ? AND MEDIA_ID = ? AND EPISODE_ID = ?`, [userId, mediaId, episodeId], (err, row) => err ? rej(err) : res(row != undefined)));

const updateContinue = (userId, mediaId, episodeId, progressTime, endTime) => new Promise( async (res, rej) => {
    const key = `${userId}_${mediaId}_${episodeId}`;
    const timeStamp = new Date().toISOString();

    if(await hasContinue(userId, mediaId, episodeId)) {
        continuePrep.update.run([progressTime, endTime, timeStamp, key], err => err ? rej(err) : res());
    }
    else {
        continuePrep.insert.run([key, userId, mediaId, episodeId, progressTime, endTime, timeStamp], err => err ? rej(err) : res());
    }
});

const continueList = (userId, limit) => new Promise( async (res, rej) => db.all(
    `SELECT mm.TYPE, uc.PROGRESS_TIME, em.SEASON_NUM, em.EPISODE_NUM, mn.*, en.TITLE AS EPISODE_TITLE, en.EPISODE_ID, en.DURATION AS EPISODE_DURATION, mi.*, ei.*
    FROM users_continue AS uc
    JOIN media_main AS mm ON mm.MEDIA_ID = uc.MEDIA_ID
    JOIN media_images AS mi ON mi.MEDIA_ID = uc.MEDIA_ID
    JOIN media_info AS mn ON mn.MEDIA_ID = uc.MEDIA_ID
    LEFT JOIN episodes_images AS ei ON ei.EPISODE_ID = uc.EPISODE_ID
    LEFT JOIN episodes_info AS en ON en.EPISODE_ID = uc.EPISODE_ID
    LEFT JOIN episodes_main AS em ON em.EPISODE_ID = uc.EPISODE_ID
    WHERE uc.USER_ID = ? AND uc.END_TIME > 180
    ORDER BY uc.TIME_STAMP DESC
    LIMIT ?`,
    [userId, limit],
    (err, rows) => err ? rej(err) : res(rows)
));

export { addUser, authenticateUser, userData, addWatchlist, removeWatchlist, watchlist, inWatchlist, updateContinue, currentEpisode, continueList };