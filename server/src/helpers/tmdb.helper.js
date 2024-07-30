import dotenv from "dotenv";
dotenv.config();

const BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/original";

/**
 *
 * @param {String} title
 * @param {Number} year
 * @param {Number} type 1 = movie, 2 = tv
 * @returns {Promise<Object>}
 */
export async function search_title(title, year, type) {
  const endpoint = type === 1 ? "movie" : "tv";
  let response = await fetch(
    `${BASE}/search/${endpoint}?query=${title}&year=${year}&api_key=${process.env.TMDB_KEY}`
  );
  if (response.ok) {
    const { results } = await response.json();
    if (!results.length) {
      throw new Error("no results");
    }
    // If both year and title match
    // If no year provided, only match title
    let best_match = results.filter((i) => {
      const date = type === 1 ? "release_date" : "first_air_date";
      i.title === title && (!year || parseInt(i[date].split("-")[0]) === year);
    });
    best_match = !best_match.length ? results[0] : best_match[0];
    response = await fetch(
      `${BASE}/${endpoint}/${best_match.id}?api_key=${process.env.TMDB_KEY}&append_to_response=images,content_ratings,releases,credits,aggregate_credits,external_ids`
    );
    if (response.ok) {
      const json = await response.json();
      function image(imgs, iso) {
        const img = imgs?.filter((i) => i.iso_639_1 === iso)[0]?.file_path;
        return img ? IMG_BASE + img : null;
      }
      function content_rating() {
        let arr, end;
        if (type === 1) {
          arr = json.releases.countries;
          end = "certification";
        } else {
          arr = json.content_ratings.results;
          end = "rating";
        }
        return arr.filter((i) => i.iso_3166_1 === "US")[0]?.[end];
      }
      return {
        title_id: json.external_ids.imdb_id,
        tmdb_id: json.id,
        title: type === 1 ? json.title : json.name,
        overview: json.overview,
        rating: content_rating(),
        vote: json.vote_average * 10,
        collection_id: json.belongs_to_collection?.id ?? null,
        budget: json.budget ?? null,
        revenue: json.revenue ?? null,
        date: type === 1 ? json.release_date : json.first_air_date,
        poster: image(json.images.posters, "en"),
        poster_nt: image(json.images.posters, null),
        backdrop: image(json.images.backdrops, null),
        landscape: image(json.images.backdrops, "en"),
        logo: image(json.images.logos, "en"),

        credits: type === 1 ? json.credits : json.aggregate_credits,
        genres: json.genres.map(i => i.name),
        duration: type === 2 ? json.episode_run_time[0] * 60 : null
      };
    } else {
      throw new Error("fetch fail");
    }
  } else {
    throw new Error("fetch fail with status " + response.status);
  }
}

/**
 * @param {Number} tmdb_id
 * @param {Number} seasonNum
 * @returns {Promise<Object>}
 */
export async function fetch_season(tmdb_id, seasonNum) {
  const response = await fetch(
    `${BASE}/tv/${tmdb_id}/season/${seasonNum}?api_key=${process.env.TMDB_KEY}&append_to_response=images,content_ratings,releases,credits,aggregate_credits,external_ids`
  );
  if (response.ok) {
    const json = await response.json();
    return json.episodes.map((i) => ({
      episode_id: i.id,
      season_num: i.season_number,
      episode_num: i.episode_number,
      title: i.name,
      overview: i.overview,
      vote: i.vote_average ? i.vote_average * 10 : null,
      date: i.air_date,
      still: i.still_path ? IMG_BASE + i.still_path : null,
    }));
  } else {
    throw new Error("fetch fail with status " + response.status);
  }
}

/**
 * @param {Number} tmdb_id
 * @returns {Promise<Object>}
 */
export async function fetch_collection(tmdb_id) {
  const response = await fetch(
    `${BASE}/collection/${tmdb_id}?api_key=${process.env.TMDB_KEY}`
  );
  if (response.ok) {
    const json = await response.json();
    function image(path) {
      return path ? IMG_BASE + "/" + path : null;
    }
    return {
      collection_id: json.id,
      title: json.name,
      overview: json.overview,
      poster: image(json.poster_path),
      backdrop: image(json.backdrop_path),
    };
  } else {
    throw new Error("fetch fail with status " + response.status);
  }
}

/**
 * @param {Number} tmdb_id
 * @returns {Promise<Object>}
 */
export async function fetch_person(tmdb_id) {
  const response = await fetch(
    `${BASE}/person/${tmdb_id}?api_key=${process.env.TMDB_KEY}`
  );
  if (response.ok) {
    const json = await response.json();
    return {
      person_id: json.id,
      name: json.name,
      birth_date: json.birthday,
      death_date: json.deathday,
      bio: json.biography,
      image: json.profile_path ? IMG_BASE + json.profile_path : null,
    };
  } else {
    throw new Error("fetch fail with status " + response.status);
  }
}

/**
 * @param {Number} tmdb_id
 * @param {Number} type 1 = movie, 2 = tv
 * @returns {Promise<Object>}
 */
export async function fetch_images(tmdb_id, type) {
  const path = type === 1 ? "movie" : "tv";
  const response = await fetch(
    `${BASE}/${path}/${tmdb_id}/images?api_key=${process.env.TMDB_KEY}`
  );
  if (response.ok) {
    const { backdrops, posters, logos } = await response.json();
    function filter(arr, iso) {
      return arr
        .filter((i) => i.iso_639_1 === iso)
        .map((i) => IMG_BASE + i.file_path);
    }
    return {
      posters: filter(posters, "en"),
      posters_nt: filter(posters, null),
      landscape: filter(backdrops, "en"),
      backdrops: filter(backdrops, null),
      logos: filter(logos, "en"),
    };
  } else {
    throw new Error("fetch fail with status " + response.status);
  }
}