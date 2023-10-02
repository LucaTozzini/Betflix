import fs from 'fs';
import axios from 'axios';
import env from '../../env.js';
import srt2vtt from 'srt-to-vtt';
import { itemIMDB, episodeIMDB } from './queries.helpers.js';
const api_key = env.OpenSubtitles_KEY;
const username = env.OpenSubtitles_username;
const password = env.OpenSubtitles_password;
const path = env.subtitlesPath;
const BASE = 'https://api.opensubtitles.com/api/v1';

let token = null;

const loginUser = () => new Promise(async (res, rej) => {
    try{
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': 'BetflixDev',
                'Content-Type': 'application/json',
            }
        };
        const data = { username, password }
        const response = await axios.post(`${BASE}/login`, data, options);

        token = response.data.token;
        res();
    }
    catch(err) {
        rej(err);
    }
});

const searchSubtitles = (imdb_id, language) => new Promise(async (res, rej) => {
    try {
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': 'BetflixDev'
            },
        };

        const response = await axios.get(`${BASE}/subtitles?imdb_id=${imdb_id}&languages=${language}&foreign_parts_only=exclude&hearing_impaired=exclude&trusted_sources=only`, options);
        if(!response.data.data || response.data.data.length == 0) {
            throw new Error("No Results")
        };
        const result = response.data.data[0];

        res(result);
    }
    catch(err) {
        rej(err);
    }
});

const getSubtitle = (file_id) => new Promise(async (res, rej) => {
    try {
        console.log('here', file_id);
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': 'BetflixDev',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        };
        const data = { file_id }
        const response = await axios.post(`${BASE}/download`, data, options);
        const subtitle = response.data;
        res(subtitle);
    }
    catch(err) {
        rej(err);
    }
});

const downloadSubtitle = (subtitle) => new Promise(async (res, rej) => {
    try {
        const url = subtitle.link;
        const localFilePath = `${path}/${subtitle.file_name}`;

        const response = await axios.get(url, { responseType: 'stream' });
        response.data.pipe(fs.createWriteStream(localFilePath));
        response.data.on('finish', () => {
            fs.createReadStream(localFilePath)
            .pipe(srt2vtt())
            .pipe(fs.createWriteStream(`${localFilePath}.vtt`))
            .on('finish', res({srt: localFilePath, vtt: `${localFilePath}.vtt`}))
        });
    }
    catch(err) {
        rej(err);
    }
});

const insertEpisodeSubtitle = (path, episodeId, language, extension) => new Promise((res, rej) => db.run(
    `INSERT INTO subtitles (PATH, EPISODE_ID, LANG, EXT) VALUES (?,?,?,?)`,
    [path, episodeId, language, extension],
    (err) => err ? rej(err) : res()
)); 

const insertMovieSubtitle = (path, mediaId, language, extension) => new Promise((res, rej) => db.run(
    `INSERT INTO subtitles (PATH, MEDIA_ID, LANG, EXT) VALUES (?,?,?,?)`,
    [path, mediaId, language, extension],
    (err) => err ? rej(err) : res()
)); 

const fetchSubtitle = (id, isEpisode, language) => new Promise(async (res, rej) => {
    try {
        const imdb_id = isEpisode ? await episodeIMDB(id) : await itemIMDB(id);
        if(!imdb_id) {
            throw new Error("No IMDB id");
        }
        console.log('imdb id:', imdb_id);

        const result = await searchSubtitles(imdb_id, language);
        const file_id = result.attributes.files[0].file_id;
        console.log('result:', result, file_id);


        await loginUser();
        console.log('logged in');

        const subtitle = await getSubtitle(file_id);
        console.log('subtitle:', subtitle);

        const files = downloadSubtitle({ file_name: subtitle.file_name, link: subtitle.link });
        console.log('files:', files);

        if(isEpisode) {
            await insertEpisodeSubtitle(files.srt, id, language, 'srt');
            await insertEpisodeSubtitle(files.vtt, id, language, 'vtt');
        }
        else {
            await insertMovieSubtitle(files.srt, id, language, 'srt');
            await insertMovieSubtitle(files.vtt, id, language, 'vtt');
        }
        res(files);
    }
    catch(err) {
        rej(err);
    }
});

export { fetchSubtitle };