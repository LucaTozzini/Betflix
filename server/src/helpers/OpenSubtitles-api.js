import env from '../../env.js';
import axios from 'axios';
import { itemIMDB, episodeIMDB } from './queries.helpers.js';
const api_key = env.OpenSubtitles_KEY;
const username = env.OpenSubtitles_username;
const password = env.OpenSubtitles_password;
const BASE = 'https://api.opensubtitles.com/api/v1';

let token = null;

const logIn = () => new Promise(async (res, rej) => {
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

const search = (imdb_id, language) => new Promise(async (res, rej) => {
    try {
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': 'BetflixDev'
            },
        };

        const response = await axios.get(`${BASE}/subtitles?imdb_id=${imdb_id}&languages=${language}&foreign_parts_only=exclude&hearing_impaired=exclude&trusted_sources=only`, options);
        const result = response.data.data[0];

        res(result);
    }
    catch(err) {
        rej(err);
    }
});

const download = (file_id) => new Promise(async (res, rej) => {
    try {
        const options = {
            headers: {
                'Api-Key': api_key,
                'User-Agent': 'BetflixDev',
                'Content-Type': 'application/json',
            }
        };
        const data = { file_id }
        const response = await axios.post(`${BASE}/download`, data, options);
        const link = response.data.link;
        res(link);
    }
    catch(err) {
        rej(err);
    }
});

const fetchSubtitle = (id, isEpisode, language) => new Promise(async (res, rej) => {
    try {
        const imdb_id = isEpisode ? await episodeIMDB(id) : await itemIMDB(id);
        const result = await search(imdb_id, language);
        const file_id = result.attributes.files.file_id;
        const link = await download(file_id);
        await logIn();

        res(search);
    }
    catch(err) {
        rej(err);
    }
});

export { fetchSubtitle };