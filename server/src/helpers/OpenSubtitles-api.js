import fs from 'fs';
import axios from 'axios';
import env from '../../env.js';
import srt2vtt from 'srt-to-vtt';
import { db } from './database.helpers.js'; 
import { itemIMDB, episodeIMDB } from './queries.helpers.js';
const api_key = env.OpenSubtitles_KEY;
const username = env.OpenSubtitles_username;
const password = env.OpenSubtitles_password;
const path = env.subtitlesPath;
const BASE = 'https://api.opensubtitles.com/api/v1';
const user_agent = 'BetflixDev';

let token = null;

const loginUser = () => new Promise(async (res, rej) => {
    try{
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': user_agent,
                'Content-Type': 'application/json',
            }
        };
        const data = { username, password }
        const response = await axios.post(`${BASE}/login`, data, options);

        token = response.data.token;
        res(response.data);
    }
    catch(err) {
        rej(err);
    }
});

const logoutUser = () => new Promise(async (res, rej) => {
    try{
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': user_agent,
                Authorization: `Bearer ${token}`
            }
        };
        const response = await axios.delete(`${BASE}/logout`, options);
        token = null;
        res(response.data);
    }
    catch(err) {
        rej(err);
    }
});

const infoUser = () => new Promise(async (res, rej) => {
    try {
        const headers = {
            'Api-Key': api_key,
            'User-Agent': user_agent,
            Authorization: `Bearer ${token}`
        };
        const response = await axios.get(`${BASE}/infos/user`, {headers});
        res(response.data.data); 
    }
    catch(err) {
        rej(err);
    }
})

const searchSubtitles = (imdb_id, language) => new Promise(async (res, rej) => {
    try {
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': user_agent
            }
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

const getSubtitleFile = (file_id) => new Promise(async (res, rej) => {
    try {
        const headers = {
            'Api-Key': api_key,
            'User-Agent': user_agent,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };

        const response = await axios.post(`${BASE}/download`, {file_id}, {headers});
        const subtitle = response.data;
        res(subtitle);
    }
    catch(err) {
        rej(err);
    }
});

const downloadSubtitle = (id, language, name, link) => new Promise(async (res, rej) => {
    const localFilePath = `${path}/${id}_${language}_${name}`;
    const response = await axios.get(link, { responseType: 'stream' }).catch(err => rej(err));
    response.data.pipe(fs.createWriteStream(localFilePath).on('finish', async () => {
        try {
            const vtt = await convertSubtitle(localFilePath);
            res({srt: localFilePath, vtt});
        }
        catch(err) {
            rej(err);
        }
    }));
});

const convertSubtitle = (path) => new Promise(async (res, rej) => {
    try {
        fs.createReadStream(path)
        .pipe(srt2vtt())
        .pipe(
            fs.createWriteStream(`${path}.vtt`)
            .on('finish', () => res(`${path}.vtt`))
        );
    }
    catch(err) {
        rej(err);
    }
})

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

        const result = await searchSubtitles(imdb_id, language);
        const file_id = result.attributes.files[0].file_id;
        await loginUser();
        const subtitle = await getSubtitleFile(file_id);
        const files = await downloadSubtitle(imdb_id, language, subtitle.file_name, subtitle.link );
        await logoutUser();

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