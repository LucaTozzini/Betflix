import { db } from "./database.helpers.js";

const shallowItemQuery = `SELECT 
                            main.IMDB_ID, 
                            main.TMDB_ID, 
                            main.TYPE, 
                            info.*, 
                            images.*, 
                            dates.*
                          FROM media_main AS main
                          JOIN media_info AS info ON main.MEDIA_ID = info.MEDIA_ID
                          JOIN media_images AS images ON main.MEDIA_ID = images.MEDIA_ID
                          JOIN media_dates AS dates ON main.MEDIA_ID = dates.MEDIA_ID`;

// Helper Functions
const compileRowData = (rows) =>
  new Promise(async (res, rej) => {
    try {
      const data = [];
      for (const row of rows) {
        const rowData = await queryMedia(row.MEDIA_ID, null);
        data.push(rowData);
      }
      res(data);
    } catch (err) {
      rej(err);
    }
  });

// Global Queries
const availableGenres = () =>
  new Promise((res, rej) =>
    db.all("SELECT DISTINCT GENRE_NAME FROM genres", (err, rows) =>
      err ? rej(err) : res(rows.map((i) => i.GENRE_NAME))
    )
  );

const queryGenres = (mediaId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT DISTINCT GENRE_NAME
    FROM media_genres
    JOIN genres ON genres.GENRE_ID = media_genres.GENRE_ID
    WHERE media_genres.MEDIA_ID = ?`,
      [mediaId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryAvailableSeasons = (mediaId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT DISTINCT SEASON_NUM 
      FROM episodes_main 
      WHERE MEDIA_ID = ? 
      ORDER BY SEASON_NUM ASC`,
      [mediaId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryMedia = (mediaId, userId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT 
				main.IMDB_ID, 
				main.TMDB_ID, 
				main.TYPE, 
				info.*, 
				images.*, 
				dates.*, 
				finances.*
			FROM media_main AS main
			JOIN media_info AS info ON main.MEDIA_ID = info.MEDIA_ID
			JOIN media_images AS images ON main.MEDIA_ID = images.MEDIA_ID
			JOIN media_dates AS dates ON main.MEDIA_ID = dates.MEDIA_ID
			JOIN media_finances AS finances ON main.MEDIA_ID = finances.MEDIA_ID
			LEFT JOIN users_continue AS continue ON main.MEDIA_ID = continue.MEDIA_ID AND USER_ID = ?
			WHERE main.MEDIA_ID = ?
      LIMIT 1`,
      [userId, mediaId],
      async (err, row) => {
        if (err) {
          console.error("Error queryMedia");
          return rej(err);
        }
        try {
          row.GENRES = await queryGenres(mediaId);
          row.AVAILABLE_SEASONS = await queryAvailableSeasons(mediaId);
          row.DIRECTORS = await queryDirectors(mediaId);
          row.CAST = await queryCast(mediaId);
          res(row);
        } catch (err) {
          console.error("Error queryMedia Post");
          rej(err);
        }
      }
    )
  );

const queryMediaByGenre = (genreName, type, orderBy, limit) =>
  new Promise((res, rej) =>
    db.all(
      `${shallowItemQuery}
      JOIN media_genres AS m_genres ON main.MEDIA_ID = m_genres.MEDIA_ID
      JOIN genres ON m_genres.GENRE_ID = genres.GENRE_ID
      WHERE GENRE_NAME = ? ${type ? "AND  TYPE = ?" : ""}
      ORDER BY  ${
        orderBy == "random"
          ? "RANDOM()"
          : orderBy == "vote"
          ? "VOTE DESC"
          : "START_DATE DESC"
      }
      LIMIT ?`,
      type ? [genreName, type, limit] : [genreName, limit],
      async (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryTitle = (title, limit) =>
  new Promise((res, rej) =>
    db.all(
      `${shallowItemQuery}
      WHERE TITLE LIKE "%"|| ? ||"%"
      ORDER BY (
        CASE
          WHEN TITLE = ? THEN 1
          WHEN TITLE LIKE ? ||"%" THEN 2
          ELSE 3
        END
      )
      LIMIT ?`,
      [title, title, title, limit],
      async (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryDateRange = (startDate, endDate, orderBy, limit) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT media_dates.MEDIA_ID
			FROM media_dates
			JOIN media_info ON media_dates.MEDIA_ID = media_info.MEDIA_ID 
			WHERE (START_DATE >= ? AND START_DATE <= ?) OR (END_DATE >= ? AND END_DATE <= ?)
			ORDER BY ${
        orderBy == "random"
          ? "RANDOM()"
          : orderBy == "vote"
          ? "media_info.VOTE DESC"
          : "media_dates.START_DATE DESC"
      }
    LIMIT ?`,
      [startDate, endDate, startDate, endDate, limit || 30],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const querylatestReleases = (limit) =>
  new Promise((res, rej) =>
    db.all(
      `${shallowItemQuery}
			ORDER BY END_DATE DESC
			LIMIT ?`,
      [limit],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryVoteRange = (minVote, maxVote, orderBy, limit) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT * 
			FROM media_info AS i
			JOIN media_images AS im ON im.MEDIA_ID = i.MEDIA_ID
			JOIN media_dates AS d ON d.MEDIA_ID = i.MEDIA_ID
			WHERE VOTE >= ? AND VOTE <= ?
			ORDER BY  ${
        orderBy == "random"
          ? "RANDOM()"
          : orderBy == "vote"
          ? "VOTE DESC"
          : "START_DATE DESC"
      }
			LIMIT ?`,
      [minVote, maxVote, limit],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

// People Queries
const queryByDirector = (personId) =>
  new Promise((res, rej) =>
    db.all(
      `${shallowItemQuery}
      JOIN directors ON main.MEDIA_ID = directors.MEDIA_ID
      WHERE directors.PERSON_ID = ?`,
      [personId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryPerson = (personId) =>
  new Promise((res, rej) =>
    db.get("SELECT * FROM people WHERE PERSON_ID = ?", [personId], (err, row) =>
      err ? rej() : res(row)
    )
  );

const queryFilmography = (personId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT MEDIA_ID
			FROM cast
			WHERE PERSON_ID = ?
			`,
      [personId],
      async (err, rows) => {
        if (err) {
          return rej(err);
        }
        compileRowData(rows)
          .then((data) => res(data))
          .catch((err) => rej(err));
      }
    )
  );

const queryPersonByName = (name, limit) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT *
    FROM people
    WHERE NAME LIKE "%"|| ? ||"%"
    ORDER BY (
      CASE 
        WHEN NAME = ? THEN 1
        WHEN NAME = ? ||"%" THEN 2
        ELSE 3
      END
    )
    LIMIT ?`,
      [name, name, name, limit],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

// TV Show Queries
const querySeason = (mediaId, seasonNum, userId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT EPISODE_ID
			FROM episodes_main
			WHERE MEDIA_ID = ? AND SEASON_NUM = ?`,
      [mediaId, seasonNum],
      async (err, rows) => {
        if (err) {
          return rej(err);
        }
        const data = [];
        for (const row of rows) {
          const rowData = await queryEpisode(row.EPISODE_ID, userId);
          data.push(rowData);
        }
        res(data);
      }
    )
  );

const queryEpisode = (episodeId, userId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT i.*, m.MEDIA_ID, m.IMDB_ID, SEASON_NUM, EPISODE_NUM, x.TYPE, PROGRESS_TIME, END_TIME, img.STILL_S, img.STILL_L, dts.AIR_DATE
			FROM episodes_info AS i 
			JOIN episodes_main AS m ON i.EPISODE_ID = m.EPISODE_ID
      JOIN episodes_images AS img ON i.EPISODE_ID = img.EPISODE_ID
      JOIN episodes_dates AS dts ON i.EPISODE_ID = dts.EPISODE_ID
			JOIN media_main AS x ON m.MEDIA_ID = x.MEDIA_ID
			LEFT JOIN users_continue AS uc ON m.EPISODE_ID = uc.EPISODE_ID AND USER_ID = ? 
			WHERE i.EPISODE_ID = ?`,
      [userId, episodeId],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

const queryNextEpisode = (mediaId, seasonNum, episodeNum) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT EPISODE_ID
			FROM episodes_main 
			WHERE MEDIA_ID = ? AND (SEASON_NUM > ? OR (SEASON_NUM = ? AND EPISODE_NUM > ?))
			ORDER BY SEASON_NUM ASC, EPISODE_NUM ASC`,
      [mediaId, seasonNum, seasonNum, episodeNum],
      (err, row) => {
        if (err) {
          return rej(err);
        }
        queryEpisode(row.EPISODE_ID)
          .then((data) => res(data))
          .catch((err) => rej(err));
      }
    )
  );

// Subtitles Queries
const querySubtitlePath = (imdbId, language, extension) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT PATH
      FROM subtitles
      WHERE 
        IMDB_ID = ? AND 
        LANG = ? AND 
        EXT = ?`,
      [imdbId, language, extension],
      (err, row) => (err ? rej(err) : res(row ? row.PATH : null))
    )
  );

const availableSubtitles = (imdbId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT EXT, LANG
      FROM subtitles
      WHERE IMDB_ID = ?`,
      [imdbId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

// Private Queries
const queryCast = (mediaId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT p.PERSON_ID, c.CHARACTER, p.NAME, p.PROFILE_IMAGE
			FROM cast AS c
			JOIN people AS p ON c.PERSON_ID = p.PERSON_ID
			WHERE c.MEDIA_ID = ?
			ORDER BY c.CAST_ORDER ASC`,
      [mediaId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryDirectors = (mediaId) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT people.*
      FROM directors
      JOIN people ON directors.PERSON_ID = people.PERSON_ID
      WHERE directors.MEDIA_ID = ?`,
      [mediaId],
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const queryOrphans = () =>
  new Promise((res, rej) =>
    db.all(
      `SELECT DISTINCT PERSON_ID 
			FROM (
        SELECT PERSON_ID FROM cast
        UNION
        SELECT PERSON_ID FROM directors
      )
			WHERE PERSON_ID NOT IN (SELECT PERSON_ID FROM people)`,
      (err, rows) => (err ? rej(err) : res(rows.map((i) => i.PERSON_ID)))
    )
  );

const haveMedia = (path) =>
  new Promise((res, rej) =>
    db.get(`SELECT * FROM media_main WHERE PATH = ?`, [path], (err, row) =>
      err ? rej(err) : res(row != undefined)
    )
  );

const haveEpisode = (path) =>
  new Promise((res, rej) =>
    db.get(`SELECT * FROM episodes_main WHERE PATH = ?`, [path], (err, row) =>
      err ? rej(err) : res(row != undefined)
    )
  );

const queryMediaPath = (mediaId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT PATH
			FROM media_main
			WHERE MEDIA_ID = ?`,
      [mediaId],
      (err, row) => (err ? rej(err) : res(row ? row.PATH : null))
    )
  );

const queryEpisodePath = (episodeId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT PATH
			FROM episodes_main
			WHERE EPISODE_ID = ?`,
      [episodeId],
      (err, row) => (err ? rej(err) : res(row ? row.PATH : null))
    )
  );

const lastEpisodeDate = (mediaId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT AIR_DATE 
        FROM episodes_dates 
            AS d
        JOIN episodes_main 
            AS m 
            ON d.EPISODE_ID = m.EPISODE_ID  
        WHERE MEDIA_ID = ?
        ORDER BY AIR_DATE DESC`,
      [mediaId],
      (err, row) => (err ? rej(err) : res(row))
    )
  );

const queryDrives = () =>
  new Promise((res, rej) =>
    db.all(
      `SELECT DISTINCT SUBSTR(PATH, 1, INSTR(PATH || '/', '/')) as DRIVE_PATH
      FROM media_main`,
      (err, rows) => (err ? rej(err) : res(rows))
    )
  );

const missingCollections = () =>
  new Promise((res, rej) =>
    db.all(
      `SELECT DISTINCT COLLECTION_ID
      FROM media_info
      WHERE COLLECTION_ID IS NOT NULL AND COLLECTION_ID NOT IN (SELECT COLLECTION_ID FROM collections)`,
      (err, rows) =>
        err ? rej(err) : res(rows.map(({ COLLECTION_ID }) => COLLECTION_ID))
    )
  );

const queryDrivePaths = (type) =>
  new Promise((res, rej) =>
    db.all(
      `SELECT path
    FROM drives
    WHERE type = ?`,
      [type],
      (err, rows) => (err ? rej(err) : res(rows.map((i) => i.path)))
    )
  );

export {
  // Global
  availableGenres,
  queryMediaByGenre,
  queryMedia,
  queryTitle,
  queryDateRange,
  querylatestReleases,
  queryVoteRange,

  // People
  queryByDirector,
  queryPerson,
  queryFilmography,
  queryPersonByName,

  // Shows
  querySeason,
  queryEpisode,
  queryNextEpisode,

  // Subtitles
  querySubtitlePath,
  availableSubtitles,

  // Private Queries
  queryOrphans,
  haveMedia,
  haveEpisode,
  queryMediaPath,
  queryEpisodePath,
  lastEpisodeDate,
  queryDrives,
  missingCollections,
  queryDrivePaths
};
