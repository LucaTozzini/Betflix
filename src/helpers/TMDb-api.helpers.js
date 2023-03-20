import getJsonFromApi from "./get-json-from-api.helper.js"

const TMDb_Key = '99c6bddf93662b05e7e8f0a1303cbca5'
const BASE = 'https://api.themoviedb.org/3'
const Img_Base = 'https://image.tmdb.org/t/p/original/'
const Img_Base_500 = 'https://image.tmdb.org/t/p/w500/'

const TMDb = {
    typeInterp(type){
        if(type == 1){
            return 'movie';
        }
        else if(type == 2){
            return 'tv';
        }
        else{
            throw new Error('Invalid Type; 1 = movie, 2 = tv')
        }
    },

    showData(path, title, year){
        return new Promise(async (resolve, reject) => {
            try{
                const id = await this.searchId(2, title, year);
                const res = await getJsonFromApi(`${BASE}/tv/${id}?api_key=${TMDb_Key}`);
    
                let content_rating = (await getJsonFromApi(`${BASE}/tv/${id}/content_ratings?api_key=${TMDb_Key}`)).results.filter(obj => obj.iso_3166_1 === 'US');
                content_rating = content_rating.length > 0 ? content_rating[0].rating : 'unrated'
                const array = [
                    `2_${id}`,
                    id, 
                    2, 
                    res.name, 
                    parseInt(res.first_air_date.split('-')[0]), 
                    parseInt(res.first_air_date.split('-').join('')), 
                    parseInt(res.last_air_date.split('-').join('')), 
                    res.overview, 
                    parseInt(parseFloat(res.vote_average) * 10),
                    parseFloat(res.episode_run_time[0]) * 60, 
                    null, 
                    null, 
                    content_rating, 
                    (await TMDb.getPosters(2, id))[0], 
                    (await TMDb.getLogos(2, id))[0], 
                    (await TMDb.getBackdrops(2, id))[0], 
                    path, 
                    res.production_companies.length > 0 ? res.production_companies[0].name : ''
    
                ]
                resolve({res, array});
            }
            catch(err){
                reject(err);
            }
        })
    },

    episodeData(path, media_id, show_id, season, episode, duration){
        return new Promise(async (resolve, reject) => {
            try{
                const res = await getJsonFromApi(`${BASE}/tv/${show_id}/season/${season}/episode/${episode}?api_key=${TMDb_Key}`);
                const array = [
                    res.id, 
                    media_id,
                    parseInt(res.season_number),
                    parseInt(res.episode_number),
                    res.name, 
                    res.air_date ? parseInt(res.air_date.split('-').join('')) : -1, 
                    res.overview ? res.overview : '', 
                    res.vote_average ? parseInt(parseFloat(res.vote_average) * 10) : -1, 
                    duration,
                    Img_Base_500 + res.still_path, // Small Still
                    Img_Base + res.still_path, // Large Still 
                    path
                ];
    
                resolve({res, array});
            }
            catch(err){
                reject(err);
            }
        })
    },

    movieData(path, title, year){
        return new Promise(async (resolve, reject) => {
            try{
                const id = await this.searchId(1, title, year);
                const res = await getJsonFromApi(`${BASE}/movie/${id}?api_key=${TMDb_Key}&append_to_response=releases`);
                if(res.success == false){
                    return resolve({status: 404});
                }
    
                const content_ratings = (await getJsonFromApi(`${BASE}/movie/${id}/release_dates?api_key=${TMDb_Key}&append_to_response=releases`)).results.filter(obj => obj.iso_3166_1 === 'US');
                let content_rating = 'NR';
                for(const release of content_ratings[0].release_dates){
                    if(release.certification.length > 0){
                        content_rating = release.certification
                        break
                    }
                } 
              
                const array = [
                    `1_${id}`,
                    id, 
                    1, 
                    res.title, 
                    parseInt(res.release_date.split('-')[0]), 
                    parseInt(res.release_date.split('-').join('')), 
                    parseInt(res.release_date.split('-').join('')), 
                    res.overview, 
                    parseInt(parseFloat(res.vote_average) * 10),
                    parseFloat(res.runtime) * 60, 
                    parseInt(res.budget), 
                    parseInt(res.revenue), 
                    content_rating, 
                    (await TMDb.getPosters(1, id))[0], 
                    (await TMDb.getLogos(1, id))[0], 
                    (await TMDb.getBackdrops(1, id))[0],
                    path, 
                    res.production_companies.length > 0 ? res.production_companies[0].name : ''
    
                ]
                resolve({res, array});
            }
            catch(err){
                reject(err);
            }
        })
    },

    searchId(type, title, year){
        return new Promise(async (resolve, reject) => {
            type = this.typeInterp(type);
            const res = await getJsonFromApi(`${BASE}/search/${type}?api_key=${TMDb_Key}&language=en&query=${title}&year=${year}`)
            if(res.results.length == 0){
                reject('No Matches');
            }
            else{
                const exact_match = res.results.filter(obj => {
                    if(obj.title != undefined){
                        return obj.title.replace(/[^A-Za-z]/g, '').toLowerCase() == title.replace(/[^A-Za-z]/g, '').toLowerCase();
                    }
                    else if(obj.name != undefined){
                        try{
                            return (obj.name.replace(/[^A-Za-z]/g, '').toLowerCase() == title.replace(/[^A-Za-z]/g, '').toLowerCase()) && (parseInt(obj.first_air_date.split('-')[0]) == year);
                        }
                        catch{
                            return false;
                        }
                    }
                    else return false;
                })
                const data = exact_match.length > 0 ? exact_match[0].id : res.results[0].id;
                resolve(data);
            }
        })
    },

    getPosters(type, itemId){
        return new Promise(async resolve => {
            type = this.typeInterp(type);
            const json = (await getJsonFromApi(`${BASE}/${type}/${itemId}/images?api_key=${TMDb_Key}&language=en`)).posters.map(image => Img_Base_500+image.file_path);;
            resolve(json);
        })
    },

    getBackdrops(type, itemId){
        return new Promise(async resolve => {
            type = this.typeInterp(type);
            const json = (await getJsonFromApi(`${BASE}/${type}/${itemId}/images?api_key=${TMDb_Key}&language=null`)).backdrops.map(image => Img_Base+image.file_path);
            resolve(json);
        })
    },

    getLogos(type, itemId){
        return new Promise(async resolve => {
            type = this.typeInterp(type);
            const json = (await getJsonFromApi(`${BASE}/${type}/${itemId}/images?api_key=${TMDb_Key}&language=en`)).logos.map(image => Img_Base_500+image.file_path);
            resolve(json);
        })
    },

    getPerson(personId){
        return new Promise(async resolve => {
            const res = await getJsonFromApi(`${BASE}/person/${personId}?api_key=${TMDb_Key}`);

            const array = [
                res.id,                       // person id
                res.name,                     //name
                res.birthday ? parseInt(res.birthday.split('-').join('')) : null, // birthday
                res.deathday ? parseInt(res.deathday.split('-').join('')) : null, //deathday
                res.biography,                //biography
                res.profile_path == null ? null : Img_Base_500+res.profile_path // image
            ];

            resolve({res, array});
        })
    },

    agregateTvCredits(showId){
        return new Promise(async resolve =>{
            const res = await getJsonFromApi(`${BASE}/tv/${showId}/aggregate_credits?api_key=${TMDb_Key}`);
            let actors = []
            for(const credit of res.cast){
                let character = [];
                for(const role of credit.roles){
                    character.push(role.character);
                }

                actors.push(
                    [
                        `2_${showId}_${credit.id}`,  // key
                        `2_${showId}`,               // media id
                        parseInt(credit.id),         // person id
                        0,                           // is director 
                        character.join(' / '),       // character
                        parseInt(credit.order)       // order
                    ]
                )
            }
            resolve(actors);
        })
    },

    movieCredits(movieId){
        return new Promise(async resolve => {
            const res = await getJsonFromApi(`${BASE}/movie/${movieId}/credits?api_key=${TMDb_Key}`);
            let actors = [];
            for(const credit of res.cast){
                actors.push(
                    [
                        `1_${movieId}_${credit.id}`,   // key
                        `1_${movieId}`,                // media id
                        parseInt(credit.id),           // person id
                        0,                             // is director 
                        credit.character,              // character
                        credit.order                   // order
                    ]
                )
            }
            resolve(actors)
        })
    }
}

export default TMDb