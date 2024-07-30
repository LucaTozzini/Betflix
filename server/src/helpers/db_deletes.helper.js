import db_connection from "./db_connection.helper.js";

export const delete_subtitle = (data) =>
  new Promise((res, rej) =>
    db_connection.run(
      "DELETE FROM subtitles WHERE title_id = ? AND episode_id = ? AND lang = ?",
      data,
      (err) => (err ? rej(err) : res())
    )
  );

export const delete_user = (user_id) =>
  new Promise((res, rej) =>
    db_connection.run("DELETE FROM users WHERE user_id = ?", user_id, (err) =>
      err ? rej(err) : res()
    )
  );

export const delete_watchlist = (user_id, title_id) =>
  new Promise((res, rej) =>
    db_connection.run(
      "DELETE FROM watchlist WHERE user_id = ? AND title_id = ?",
      [user_id, title_id],
      (err) => (err ? rej(err) : res())
    )
  );

export const delete_torrent = (uri) =>
  new Promise((res, rej) =>
    db_connection.run("DELETE FROM torrents WHERE uri = ?", [uri], (err) =>
      err ? rej(err) : res()
    )
  );
