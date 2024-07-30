import db_connection from "./db_connection.helper.js";

export const update_continue = (user_id, title_id, episode_id, remaining) =>
  new Promise((res, rej) =>
    db_connection.run(
      "UPDATE continue SET remaining = ?, timestamp = CURRENT_TIMESTAMP WHERE user_id = ? AND title_id = ? AND episode_id = ?",
      [remaining, user_id, title_id, episode_id],
      (err) => (err ? rej(err) : res())
    )
  );

export const update_user = (user_id, image) =>
  new Promise((res, rej) =>
    db_connection.run(
      "UPDATE users SET image = ? WHERE user_id = ?",
      [image, user_id],
      (err) => (err ? rej(err) : res())
    )
  );
