import getJsonFromApi from "./get-json-from-api.helper.js"

const TMDb_Key = '99c6bddf93662b05e7e8f0a1303cbca5'
const BASE = 'https://api.themoviedb.org'
const Img_Base = 'https://image.tmdb.org/t/p/original/'
const Img_Base_500 = 'https://image.tmdb.org/t/p/w500/'

const TMDb = {
    searchTitle(type, title, year){
        return new Promise(async resolve => {
            const json = (await getJsonFromApi(`${BASE}/3/search/${type}?api_key=${TMDb_Key}&language=en&query=${title}&year=${year}`)).results.map(
                async ({
                    id, 
                    name, 
                    overview, 
                    vote_average, 
                    poster_path, 
                    backdrop_path, 
                    genre_ids
                }) => ({
                    id, 
                    title: name, 
                    overview, 
                    vote_average, 
                    poster: Img_Base_500+poster_path, 
                    backdrop: Img_Base+backdrop_path, 
                    logo: (await this.getLogos(type, id))[0],
                    genre_ids,
                    cast: await this.getCast(type, id),
                })
            )[0];
            resolve(json);
        })
    },
    getPosters(type, itemId){
        return new Promise(async resolve => {
            const json = (await getJsonFromApi(`${BASE}/3/${type}/${itemId}/images?api_key=${TMDb_Key}&language=en`)).posters.map(image => Img_Base_500+image.file_path);;
            resolve(json);
        })
    },
    getBackdrops(type, itemId){
        return new Promise(async resolve => {
            const json = (await getJsonFromApi(`${BASE}/3/${type}/${itemId}/images?api_key=${TMDb_Key}&language=null`)).backdrops.map(image => Img_Base+image.file_path);
            resolve(json);
        })
    },
    getLogos(type, itemId){
        return new Promise(async resolve => {
            const json = (await getJsonFromApi(`${BASE}/3/${type}/${itemId}/images?api_key=${TMDb_Key}&language=en`)).logos.map(image => Img_Base_500+image.file_path);
            resolve(json);
        })
    },
    getCast(type, itemId){
        return new Promise(async resolve => {
            if(type == 'movie'){
                const json = (await getJsonFromApi(`${BASE}/3/movie/${itemId}/credits?api_key=${TMDb_Key}`)).cast.map(({id, character}) => ({id, character}));
                resolve(json);
            }
            else{
                const json = (await getJsonFromApi(`${BASE}/3/tv/${itemId}/aggregate_credits?api_key=${TMDb_Key}`)).cast.map(
                    ({id, roles}) => ({
                        id, 
                        character: (roles.map(({character}) => character).join(' / ')) 
                    })
                );
                resolve(json);
            }
        })
    },
    getActor(creditId){
        return new Promise(async resolve => {
            const json = await getJsonFromApi(`${BASE}/3/credit/${creditId}?api_key=${TMDb_Key}`);
            resolve(json);
        })
    }
}

export default TMDb