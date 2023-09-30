import axios from 'axios';
import { manager, db } from "./database.helpers.js";
import env from '../../env.js';

const TMDb_Key = env.TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';
const Img_Base = 'https://image.tmdb.org/t/p/original';
const Img_Base_500 = 'https://image.tmdb.org/t/p/w500';
const Img_Base_200 = 'https://image.tmdb.org/t/p/w200';

const fetchItem = (type, item) => new Promise( async (res, rej) => {
    try{
        const search_response = type == 1 ? 
            await axios.get(`${BASE}/search/movie?language=en&query=${item.title}&year=${item.year}&api_key=${TMDb_Key}`) 
            : 
            await axios.get(`${BASE}/search/tv?first_air_date_year=${item.year}&query=${item.title}&api_key=${TMDb_Key}`)
        ;
        
        const results = search_response.data.results;
        const filtered = results.filter(curr => (item.title == curr.title && item.year == parseInt(curr.release_date.split('-')[0])));
        const match = (filtered[0] || results[0]);
        
        if(match == undefined) throw new Error(`No match for ${item.title}`);

        const match_response = type == 1 ?  
            await axios.get(`${BASE}/movie/${match.id}?api_key=${TMDb_Key}&append_to_response=images,releases,credits`) 
            :
            await axios.get(`${BASE}/tv/${match.id}?api_key=${TMDb_Key}&append_to_response=images,content_ratings,aggregate_credits,external_ids`)
        ;

        const match_data = match_response.data; 

        const backdrop = match_data.images.backdrops.filter(i => i.iso_639_1 == null)[0];
        const logo = match_data.images.logos.filter(i => i.iso_639_1 == 'en')[0];
        const poster = match_data.images.posters.filter(i => i.iso_639_1 == 'en')[0];
        const poster_nt =match_data.images.posters.filter(i => i.iso_639_1 == null)[0];
        const poster_w = match_data.images.backdrops.filter(i => i.iso_639_1 == 'en')[0];
        
        const content_rating = type == 1 ? 
            match_data.releases.countries.filter(i => (i.iso_3166_1 == 'US' && i.certification != ''))[0] 
            : 
            match_data.content_ratings.results.filter(i => (i.iso_3166_1 == 'US' && i.certification != ''))[0]
        ;
        
        const data = ({
            // main
            media_id: type == 1 ? `mv_${match.id}` : `sh_${match.id}`,
            tmdb_id: match.id,
            imdb_id: type == 1 ? match_data.imdb_id : match_data.external_ids.imdb_id,
            type,
            path: item.path,
            
            // images
            backdrop_s: backdrop ? Img_Base_500 + backdrop.file_path : null,
            backdrop_l: backdrop ? Img_Base + backdrop.file_path : null,
            logo_s: logo ? Img_Base_500 + logo.file_path : null,
            logo_l: logo ? Img_Base + logo.file_path : null,
            poster_s: poster ? Img_Base_200 + poster.file_path : null,
            poster_l: poster ? Img_Base + poster.file_path : null,
            poster_nt_s: poster_nt ? Img_Base_200 + poster_nt.file_path : null,
            poster_nt_l: poster_nt ? Img_Base + poster_nt.file_path : null,
            poster_w_s: poster_w ? Img_Base_500 + poster_w.file_path : null,
            poster_w_l: poster_w ? Img_Base + poster_w.file_path : null,

            // dates
            year: type == 1 ? match.release_date.split('-')[0] : match.first_air_date.split('-')[0],
            start_date: type == 1 ? match.release_date : match.first_air_date,
            end_date: type == 1 ? match.release_date : match.first_air_date,

            // finances
            budget: match_data.budget || null,
            revenue: match_data.revenue || null,

            // info
            title: type == 1 ? match.title : match.name,
            overview: match.overview,
            content_rating: content_rating ? content_rating.certification : 'NR',
            companies: match_data.production_companies.map(i => i.name),
            duration: type == 1 ? item.duration : parseFloat(match_data.episode_run_time[0]) * 60,
            vote: match.vote_average,

            // genres
            genres: match_data.genres.map(i => i.id),

            // credits
            credits: type == 1 ? 
                match_data.credits.cast.map(i => ({id: i.id, character: i.character, order: i.order})) 
                : 
                match_data.aggregate_credits.cast.map(i => ({id: i.id, character: i.roles.map(x => x.character).join('/'), order: i.order}))
        });
        res(data);
    }
    catch(err){
        console.error('rejected', item.title, err.message);
        rej(err);
    }
});

const fetchShow = (show) => new Promise( async (res, rej) => {
    try{
        const showData = await fetchItem(2, show);
        const seasons = [...new Set(show.episodes.map(i => i.season_num))];
        let seasonsData = [];
        for(const season of seasons) {
            try{
                const response = await axios.get(`${BASE}/tv/${showData.tmdb_id}/season/${season}?api_key=${TMDb_Key}`);
                seasonsData.push(...response.data.episodes);
            }
            catch(err){

            }
        };

        const episodeArray = [];
        for(const episode of show.episodes) {
            const match = seasonsData.find(i => i.season_number == episode.season_num && i.episode_number == episode.episode_num);
            if(!match) continue;
            const data = {
                episode_id: match.id,
                season_num: match.season_number,
                episode_num: match.episode_number,
                path: episode.path,
                still_s: `${Img_Base_500}/${match.still_path}`,
                still_l: `${Img_Base}/${match.still_path}`,
                year: match.air_date.split('-')[0],
                air_date: match.air_date,
                title: match.name,
                overview: match.overview,
                duration: episode.duration,
                vote: match.vote_average
            };
            episodeArray.push(data);
        };
        
        showData['episodes'] = episodeArray;
        res(showData);
    }
    catch(err){
        console.log('error with', show.title, err.message);
    }
});

const mediaInfo = (mediaId) => new Promise((res, rej) => db.get(
    `SELECT TMDB_ID, TYPE
    FROM media_main
    WHERE MEDIA_ID = ?`,
    [mediaId],
    (err, row) => err ? rej(err) : res(row)
));

const fetchImages = (mediaId) => new Promise( async (res, rej) => {
    try {
        const info = await mediaInfo(mediaId);
        const id = info.TMDB_ID;
        const type = info.TYPE;

        const url = `${BASE}/${type == 2 ? 'tv' : 'movie'}/${id}/images?api_key=${TMDb_Key}`;
        const response = await axios.get(url);
        const data = response.data;

        const backdrops = data.backdrops ? data.backdrops.filter(i => i.iso_639_1 == null).map(i => ({
            large: Img_Base + i.file_path, 
            small: Img_Base_500 + i.file_path
        })) : [];

        const posters_wide = data.backdrops ? data.backdrops.filter(i => i.iso_639_1 == 'en').map(i => ({
            large: Img_Base + i.file_path,
            small: Img_Base_500 + i.file_path,
        })) : [];

        const posters = data.posters ? data.posters.filter(i => i.iso_639_1 == 'en').map(i => ({
            large: Img_Base + i.file_path,
            small: Img_Base_200 + i.file_path,
        })) : [];

        const posters_nt = data.posters ? data.posters.filter(i => i.iso_639_1 == null).map(i => ({
            large: Img_Base + i.file_path,
            small: Img_Base_200 + i.file_path,
        })) : [];

        const logos = data.logos ? data.logos.filter(i => i.iso_639_1 == 'en').map(i => ({
            large: Img_Base + i.file_path,
            small: Img_Base_500 + i.file_path,
        })) : [];
        
        res({
            backdrops,
            posters,
            posters_nt,
            posters_wide,
            logos
        });
    }
    catch(err) {
        rej(err);
    }
});

const fetchPerson = (id) => new Promise( async (res, rej) => {
        try{
            const response = await axios.get(`${BASE}/person/${id}?api_key=${TMDb_Key}&language=en`);
            const data = response.data;
            
            const obj = {
                person_id: data.id,
                name: data.name,
                biography: data.biography,
                birth_date: data.birthday,
                death_date: data.deathday,
                profile_image: data.profile_path ? `${Img_Base_500}${data.profile_path}` : null
            };

            res(obj);
        }
        catch(err){
            console.error(err.message);
            rej(err);
        }
});

export { fetchItem, fetchPerson, fetchShow, fetchImages };