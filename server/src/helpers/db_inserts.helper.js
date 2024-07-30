import db_connection from "./db_connection.helper.js";

/**
 * @param {[collection_id, title, overview, poster, backdrop]} data
 * @returns {Promise<Boolean>}
 */
export const insert_collection = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO collections (
        collection_id, 
        title, 
        overview, 
        poster, 
        backdrop
      ) VALUES (?,?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

/**
 * @param {[title_id, tmdb_id, type, path, title, overview, rating,vote, duration, collection_id, budget, revenue, date, poster, poster_nt, backdrop, landscape, logo]} data
 * @returns {Promise<Boolean>}
 */
export const insert_title = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO titles (
        title_id,
        tmdb_id,
        type,
        path,
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
        logo
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_episodes = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO episodes (
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
      still
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_genres = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO genres (title_id, genre) VALUES (?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_people = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO people (
      person_id,
      name,
      birth_date,
      death_date,
      bio,
      image
    ) VALUES (?,?,?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_cast = (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO cast (
        person_id,
        title_id,
        role,
        cast_order
      ) VALUES (?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_directors = async (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO directors (person_id, title_id) VALUES (?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

/**
 * @param {[name: string, image: string]} data
 * @returns
 */
export const insert_user = async (data) =>
  new Promise((res, rej) =>
    db_connection.run(
      `INSERT INTO users (name, image) VALUES (?,?)`,
      data,
      (err) => (err ? rej(err) : res())
    )
  );

export const insert_continue = (user_id, title_id, episode_id, remaining) =>
  new Promise((res, rej) =>
    db_connection.run(
      `INSERT INTO continue (
      user_id,
      title_id,
      episode_id,
      remaining
    ) VALUES (?,?,?,?)`,
      [user_id, title_id, episode_id, remaining],
      (err) => (err ? rej(err) : res())
    )
  );

export const insert_watchlist = async (user_id, title_id) =>
  new Promise((res, rej) =>
    db_connection.run(
      `INSERT INTO watchlist (user_id, title_id) VALUES (?,?)`,
      [user_id, title_id],
      (err) => (err ? rej(err) : res())
    )
  );

/**
 * @param {[path: string, title_id: string, episode_id: number, lang: string, ext: string]} data
 * @returns {Promise}
 */
export const insert_subtitle = async (data) =>
  new Promise((res, rej) => {
    db_connection.run(
      `INSERT INTO subtitles (
      path,
      title_id,
      episode_id,
      lang,
      ext
    ) VALUES (?,?,?,?,?)`,
      data,
      (err) => (err ? rej(err) : res(1))
    );
  });

export const insert_torrent = async (data) =>
  new Promise((res) =>
    db_connection.run("INSERT INTO torrents (uri) VALUES (?)", data, (err) =>
      err ? res(false) : res(true)
    )
  );
