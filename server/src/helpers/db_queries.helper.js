import db_connection from "./db_connection.helper.js";

export const exists_title_path = (path) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM titles WHERE path = ?) AS e",
      [path],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_title = (title_id) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM titles WHERE title_id = ?) AS e",
      [title_id],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_episode_path = (path) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM episodes WHERE path = ?) AS e",
      [path],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_episode = (episode_id) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM episodes WHERE episode_id = ?) AS e",
      [episode_id],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_person = (person_id) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM people WHERE person_id = ?) AS e",
      [person_id],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_cast = (title_id, cast_order) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM cast WHERE title_id = ? AND cast_order = ?) AS e",
      [title_id, cast_order],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const exists_collection = (collection_id) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT EXISTS (SELECT * FROM collections WHERE collection_id = ?) AS e",
      [collection_id],
      (err, row) => (err ? rej(err) : res(row.e))
    );
  });

export const query_subtitle = (title_id, episode_id, language, ext) =>
  new Promise((res, rej) => {
    db_connection.get(
      "SELECT path FROM subtitles WHERE title_id = ? AND episode_id = ? AND lang = ? AND ext = ?",
      [title_id, episode_id, language, ext],
      (err, row) => (err ? rej(err) : res(row))
    );
  });

export const query_users = () =>
  new Promise((res, rej) =>
    db_connection.all("SELECT * FROM users", (err, rows) =>
      err ? rej(err) : res(rows)
    )
  );

export const query_user = (user_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT * FROM users WHERE user_id = ?",
      [user_id],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

export const query_title = (title_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT * FROM titles WHERE title_id = ?",
      [title_id],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

export const query_title_genres = (title_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT genre FROM genres WHERE title_id = ?",
      [title_id],
      (err, rows) => (err ? rej(err) : res(rows.map(({ genre }) => genre)))
    )
  );

export const query_titles_latest = () =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT * FROM titles ORDER BY date DESC LIMIT 30",
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_cast = (title_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT person_id, role, name, image, cast_order FROM cast NATURAL JOIN people WHERE title_id = ? ORDER BY cast_order ASC",
      [title_id],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_available_seasons = (title_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT season_num FROM episodes WHERE title_id = ? GROUP BY season_num ORDER BY season_num ASC",
      [title_id],
      (err, rows) => (err ? rej(err) : res(rows.map((i) => i.season_num)))
    )
  );

export const query_episodes = (title_id, season_num) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT * FROM episodes WHERE title_id = ? AND season_num = ? ORDER BY episode_num ASC",
      [title_id, season_num],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_episode = (episode_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT * FROM episodes WHERE episode_id = ? ",
      [episode_id],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

export const query_titles_voted = () =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT * FROM titles ORDER BY vote DESC LIMIT 30",
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_titles_search = (title) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT * FROM titles WHERE title LIKE '%' || ? || '%'",
      [title],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_people_search = (name) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT * FROM people WHERE name LIKE '%' || ? || '%'",
      [name],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_filmography = (person_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT t.* FROM cast c JOIN titles t ON c.title_id = t.title_id WHERE c.person_id = ? ORDER BY t.date DESC",
      [person_id],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_watchlist_titles = (user_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      "SELECT t.* FROM watchlist w JOIN titles t ON w.title_id = t.title_id WHERE w.user_id = ? ORDER BY w.timestamp DESC",
      [user_id],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_similar_titles = (title_id) =>
  new Promise(async (res, rej) => {
    try {
      // 1. Get base title details
      const baseTitle = await query_title(title_id);
      const baseGenres = await query_title_genres(title_id);
      const { collection_id } = baseTitle;

      // 2. SQL to find similar titles
      const query = `
          SELECT t.*
          FROM titles t
          JOIN genres g ON t.title_id = g.title_id 
          WHERE t.title_id != ? 
            AND (g.genre IN (${baseGenres.map(() => "?").join(",")})
                 OR t.collection_id = ? )
          GROUP BY t.title_id
          ORDER BY 
            COUNT(*) DESC,    -- Most genre matches first
            abs(julianday(t.date) - julianday(?)) ASC  -- Then closest release date
          LIMIT 30
        `;

      // 3. Prepare parameters and execute
      const params = [title_id, ...baseGenres, collection_id, baseTitle.date];
      db_connection.all(query, params, (err, rows) => {
        if (err) rej(err);
        else res(rows);
      });
    } catch (error) {
      rej(error);
    }
  });

export const query_person = (person_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT * FROM people WHERE person_id = ?",
      [person_id],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

export const query_continue = (user_id) =>
  new Promise((res, rej) =>
    db_connection.all(
      `SELECT t.*, e.season_num, e.episode_num, e.still, e.episode_id, e.duration AS episode_duration, c.remaining
      FROM continue AS c 
      JOIN titles AS t ON t.title_id = c.title_id
      LEFT JOIN episodes AS e ON e.episode_id = c.episode_id
      WHERE c.user_id = ? AND c.remaining > 10
      ORDER BY c.timestamp DESC`,
      user_id,
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

export const query_continue_entry = (user_id, title_id, episode_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT * FROM continue WHERE user_id = ? AND title_id = ? AND episode_id = ?",
      [user_id, title_id, episode_id],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

export const exists_continue = (user_id, title_id, episode_id) =>
  new Promise((res, rej) =>
    db_connection.get(
      "SELECT EXISTS(SELECT * FROM continue WHERE user_id = ? AND title_id = ? AND episode_id = ?) AS e",
      [user_id, title_id, episode_id],
      (err, row) => (err ? rej(err) : res(row?.e))
    )
  );

export const query_torrents = () =>
  new Promise((res, rej) =>
    db_connection.all("SELECT * FROM torrents", (err, rows) =>
      err ? rej(err) : res(rows)
    )
  );
