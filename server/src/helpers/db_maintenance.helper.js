import { scan_movies, show_folders, scan_show } from "./files_util.helpers.js";
import {
  exists_person,
  exists_title,
  exists_cast,
  exists_collection,
  exists_episode,
} from "./db_queries.helper.js";
import {
  search_title,
  fetch_person,
  fetch_collection,
  fetch_season,
} from "./tmdb.helper.js";
import {
  insert_title,
  insert_people,
  insert_cast,
  insert_collection,
  insert_genres,
  insert_directors,
  insert_episodes,
} from "./db_inserts.helper.js";
import { STATUS, updateStatus } from "./db_manager.helper.js";

const genreMap = {
  // movie
  Action: ["Action"],
  Adventure: ["Adventure"],
  Fantasy: ["Fantasy"],
  History: ["History"],
  Horror: ["Horror"],
  Music: ["Music"],
  Romance: ["Romance"],
  "Science Fiction": ["Sci-Fi"],
  "TV Movie": ["TV Movie"],
  Thriller: ["Thriller"],
  War: ["War"],

  // tv
  "Action & Adventure": ["Action", "Adventure"],
  Kids: ["Kids"],
  News: ["News"],
  Reality: ["Reality"],
  "Sci-Fi & Fantasy": ["Sci-Fi", "Fantasy"],
  Soap: ["Soap"],
  Talk: ["Talk"],
  "War & Politics": ["War", "Politics"],

  // universal
  Animation: ["Animation"],
  Comedy: ["Comedy"],
  Crime: ["Crime"],
  Documentary: ["Documentary"],
  Drama: ["Drama"],
  Family: ["Family"],
  Mystery: ["Mystery"],
  Western: ["Western"],
};

async function update_people(cast) {
  const fetchPeople = [];
  let count = 0;
  for (const { person_id } of cast) {
    if (await exists_person(person_id)) {
      continue;
    }

    // TMDb rate limit = 20
    if (count === 19) {
      await Promise.all(fetchPeople);
      await new Promise((res) => setTimeout(res, 250));
      count = 0;
    }
    fetchPeople.push(fetch_person(person_id));
    count++;
  }
  const people = await Promise.all(fetchPeople);

  for (const person of people) {
    try {
      if (!(await exists_person(person.person_id))) {
        await insert_people(Object.values(person));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return 1;
}

async function update_cast(title_id, cast) {
  for (const { person_id, role, cast_order } of cast) {
    if (!(await exists_cast(title_id, cast_order))) {
      await insert_cast([person_id, title_id, role, cast_order]);
    }
  }
}

async function update_directors(title_id, directors) {
  for (const { person_id } of directors) {
    try {
      await insert_directors([person_id, title_id]);
    } catch (err) {
      console.error(err);
    }
  }
}

async function update_genres(title_id, genres) {
  for (const g of genres) {
    for (const genre of genreMap[g]) {
      try {
        await insert_genres([title_id, genre]);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

async function update_episodes(title_id, tmdb_id, episodes) {
  const seasons = {};
  for (const { path, season_num, episode_num, duration } of episodes) {
    if (!seasons[season_num]) {
      try {
        seasons[season_num] = await fetch_season(tmdb_id, season_num);
      } catch (err) {
        console.error(err.message, path);
        continue;
      }
    }

    const find = seasons[season_num].filter(
      (i) => i.episode_num === episode_num
    )[0];
    if (!find) {
      continue;
    }
    const { episode_id, title, overview, vote, date, still } = find;

    const episode_data = [
      title_id,
      episode_id,
      path,
      season_num,
      episode_num,
      title,
      overview,
      vote,
      duration,
      date,
      still,
    ];

    if (!(await exists_episode(episode_id))) {
      try {
        await insert_episodes(episode_data);
      } catch (err) {
        console.error(err);
      }
    }
  }
}

/**
 * @param {{path: string, title: string, year: number, duration: number}} file
 * @returns {Promise}
 */
async function update_movie(file) {
  const type = 1;
  let search;
  try {
    search = await search_title(file.title, file.year, type);
  } catch (err) {
    console.error(err);
    return -1;
  }
  const {
    title_id,
    tmdb_id,
    title,
    overview,
    rating,
    vote,
    collection_id,
    budget,
    revenue,
    date,
    poster,
    poster_nt,
    backdrop,
    landscape,
    logo,
    credits,
    genres,
  } = search;

  const title_data = [
    title_id,
    tmdb_id,
    type,
    file.path,
    title,
    overview,
    rating,
    vote,
    file.duration,
    collection_id,
    budget,
    revenue,
    date,
    poster,
    poster_nt,
    backdrop,
    landscape,
    logo,
  ];

  if (collection_id && !(await exists_collection(collection_id))) {
    const collection = await fetch_collection(collection_id);
    await insert_collection(Object.values(collection));
  }

  const cast = credits.cast.map((i) => ({
    person_id: i.id,
    role: i.character,
    cast_order: i.order,
  }));

  const directors = credits.crew
    .filter(({ job }) => job === "Director")
    .map((i) => ({ person_id: i.id }));

  await update_people([...cast, ...directors]);

  if (!(await exists_title(title_id))) {
    await insert_title(title_data);
  }

  await update_cast(title_id, cast);
  await update_genres(title_id, genres);
  await update_directors(title_id, directors);
}

/**
 * @param {string} folder_path
 * @returns {Promise}
 */
async function update_show(show) {
  const type = 2;
  
  let search;
  try {
    search = await search_title(show.title, show.year, type);
  } catch (err) {
    console.error(err.message, path);
    return -1;
  }

  const {
    title_id,
    tmdb_id,
    title,
    overview,
    rating,
    vote,
    collection_id,
    budget,
    revenue,
    date,
    poster,
    poster_nt,
    backdrop,
    landscape,
    logo,
    credits,

    genres,
    duration,
  } = search;

  const title_data = [
    title_id,
    tmdb_id,
    type,
    show.path,
    title,
    overview,
    rating,
    vote,
    duration,
    collection_id,
    budget,
    revenue,
    date,
    poster,
    poster_nt,
    backdrop,
    landscape,
    logo,
  ];
  const cast = credits.cast.map((i) => ({
    person_id: i.id,
    role: i.roles.map((x) => x.character).join(" / "),
    cast_order: i.order,
  }));

  await update_people(cast);
  if (!(await exists_title(title_id))) {
    await insert_title(title_data);
  }
  await update_cast(title_id, cast);
  await update_genres(title_id, genres);
  await update_episodes(title_id, tmdb_id, show.episodes);
}

export async function update_movies() {
  const files = await scan_movies();
  for (const [index, file] of files.entries()) {
    const task = `updating movies ==> ${file.title} (${file.year})`;
    const task_progress = index / files.length;
    updateStatus(task, STATUS.ACTIVE_SUBTASK, task_progress, STATUS.SUBTASK_PROGRESS)
    await update_movie(file);
  }
}

export async function update_shows() {
  const folders = await show_folders();
  for (const [index, folder_path] of folders.entries()) {
    const show = await scan_show(folder_path);
    const task = `updating shows ==> ${show.title} (${show.year})`
    const task_progress = index / folders.length;
    updateStatus(task, STATUS.ACTIVE_SUBTASK, task_progress, STATUS.SUBTASK_PROGRESS)
    await update_show(show);
  }
}
