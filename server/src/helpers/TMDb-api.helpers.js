import axios from 'axios';
import { manager } from "./database.helpers.js";
import env from '../../env.js';

const TMDb_Key = env.TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';
const Img_Base = 'https://image.tmdb.org/t/p/original';
const Img_Base_500 = 'https://image.tmdb.org/t/p/w500';
const Img_Base_200 = 'https://image.tmdb.org/t/p/w200';

const fetchMovies = (movies) => new Promise( async (res, rej) => {
    try{
        manager.status.ACTION = 'Fetch Movie Data';
        manager.status.PROGRESS = 0;
        const returnArray = [];
        let i = 0;
        for(const movie of movies){
            i++;
            manager.status.PROGRESS = (100 / movies.length) * i;
    
            try{
                const search_response = await axios.get(`${BASE}/search/movie?api_key=${TMDb_Key}&language=en&query=${movie.title}&year=${movie.year}`);
                const search_data = search_response.data.results;
                const filtered = search_data.filter(item => (movie.title == item.title && movie.year == parseInt(item.release_date.split('-')[0])));
                const match = (filtered[0] || search_data[0]);
                
                if(match == undefined) throw new Error(`No match for ${movie.title}`);
    
                const match_response = await axios.get(`${BASE}/movie/${match.id}?api_key=${TMDb_Key}&append_to_response=images,releases,credits`);
    
                const backdrop = match_response.data.images.backdrops.filter(i => i.iso_639_1 == null)[0];
                const logo = match_response.data.images.logos.filter(i => i.iso_639_1 == 'en')[0];
                const poster = match_response.data.images.posters.filter(i => i.iso_639_1 == 'en')[0];
                const poster_nt = match_response.data.images.posters.filter(i => i.iso_639_1 == null)[0];
                const poster_w = match_response.data.images.backdrops.filter(i => i.iso_639_1 == 'en')[0];
                
                const content_rating = match_response.data.releases.countries.filter(i => (i.iso_3166_1 == 'US' && i.certification != ''))[0];
                
                const data = ({
                    // main
                    media_id: `mv_${match.id}`,
                    item_id: match.id,
                    type: 1,
                    path: movie.path,
                    
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
                    year: match.release_date.split('-')[0],
                    start_date: match.release_date,
                    end_date: match.release_date,
        
                    // finances
                    budget: match_response.data.budget || null,
                    revenue: match_response.data.revenue || null,
    
                    // info
                    title: match.title,
                    overview: match.overview,
                    content_rating: content_rating ? content_rating.certification : 'NR',
                    companies: match_response.data.production_companies.map(i => i.name),
                    duration: movie.duration,
                    vote: match.vote_average,
    
                    // genres
                    genres: match_response.data.genres.map(i => i.id),
    
                    // credits
                    credits: match_response.data.credits.cast.map(i => ({id: i.id, character: i.character, order: i.order}))
                })
                returnArray.push(data);
            }
            catch(err){
                console.error('rejected', movie.title);
            }
        };
        res(returnArray);
    }
    catch(err){
        rej(err);
    }
});

const fetchPeople = (ids) => new Promise( async (res, rej) => {
    manager.status.ACTION = 'Fetching people';
    manager.status.PROGRESS = 0;
    const returnArray = [];

    let i = 0;
    for(const id of ids){
        i++;
        manager.status.PROGRESS = (100 / ids.length) * i;
        try{
            const response = await axios.get(`${BASE}/person/${id}?api_key=${TMDb_Key}&language=en`);
            const data = response.data;
            returnArray.push({
                person_id: data.id,
                name: data.name,
                biography: data.biography,
                birth_date: data.birthday,
                death_date: data.deathday,
                profile_image: data.profile_path ? `${Img_Base_500}${data.profile_path}` : null
            })
        }
        catch(err){
            console.error(err.message);
        }
    };
    res(returnArray);
});

const searchShow = (show) => new Promise( async (res, rej) => {
    try{
        const 
        response = await axios.get(`${BASE}/search/tv?first_air_date_year=${show.year}&query=${show.title}&api_key=${TMDb_Key}`),
        results = response.data.results, 
        match = results.filter(i => i.name == show.title)[0] || results[0];
        if(match == undefined) throw new Error(`No match for ${show.title}`);
        const match_response = await axios.get(`${BASE}/tv/${match.id}?api_key=${TMDb_Key}&append_to_response=images,content_ratings,aggregate_credits`);
        
        const backdrop = match_response.data.images.backdrops.filter(i => i.iso_639_1 == null)[0];
        const logo = match_response.data.images.logos.filter(i => i.iso_639_1 == 'en')[0];
        const poster = match_response.data.images.posters.filter(i => i.iso_639_1 == 'en')[0];
        const poster_nt = match_response.data.images.posters.filter(i => i.iso_639_1 == null)[0];
        const poster_w = match_response.data.images.backdrops.filter(i => i.iso_639_1 == 'en')[0];

        const content_rating = match_response.data.content_ratings.results.filter(i => (i.iso_3166_1 == 'US' && i.certification != ''))[0];
        const data = ({
            // main
            media_id: `sh_${match.id}`,
            item_id: match.id,
            type: 2,
            path: show.path,
            
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
            year: match.first_air_date.split('-')[0],
            start_date: match.first_air_date,
            end_date: match.first_air_date,

            // finances
            budget: null,
            revenue: null,

            // info
            title: match.name,
            overview: match.overview,
            content_rating: content_rating ? content_rating.rating : 'NR',
            companies: match_response.data.production_companies.map(i => i.name),
            duration: parseFloat(match_response.data.episode_run_time[0]) * 60,
            vote: match.vote_average,

            // genres
            genres: match_response.data.genres.map(i => i.id),

            // credits
            credits: match_response.data.aggregate_credits.cast.map(i => ({id: i.id, character: i.roles.map(x => x.character).join('/'), order: i.order}))
        });
        res(data);
    }
    catch(err){
        rej(err);
    }
});

const fetchShows = (shows) => new Promise( async (res, rej) => {
    manager.status.ACTION = 'Fetching Episode Data';
    manager.status.PROGRESS = 0
    try{
        let i = 0;
        const returnArray = [] 
        for(const show of shows){
            i++;
            manager.status.PROGRESS = (100 / shows.length) * i;
            try{
                const showData = await searchShow(show);
                const seasons = [...new Set(show.episodes.map(i => i.season_num))];
                let seasonsData = [];
                for(const season of seasons) {
                    try{
                        const response = await axios.get(`${BASE}/tv/${showData.item_id}/season/${season}?api_key=${TMDb_Key}`);
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
                returnArray.push(showData);
            }
            catch(err){
                console.log('error with', show.title, err.message);
            }
        };
        res(returnArray);
    }
    catch(err){
        rej(err);
    }
});

export { fetchMovies, fetchPeople, fetchShows };