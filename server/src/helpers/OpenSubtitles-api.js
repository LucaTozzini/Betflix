import fs from "fs";
import axios from "axios";
import env from "../../env.js";
import srt2vtt from "srt-to-vtt";
import { db } from "./database.helpers.js";
import {
  queryMedia,
  queryEpisode,
  queryMediaPath,
  queryEpisodePath,
} from "./queries.helpers.js";
const api_key = env.OpenSubtitles_KEY;
const username = env.OpenSubtitles_username;
const password = env.OpenSubtitles_password;
const path = env.subtitlesPath;
const BASE = "https://api.opensubtitles.com/api/v1";
const user_agent = "BetflixDev";

let token = null;

// User
const loginUser = () =>
  new Promise(async (res, rej) => {
    try {
      const options = {
        headers: {
          "Api-Key": api_key,
          "User-Agent": user_agent,
          "Content-Type": "application/json",
        },
      };
      const data = { username, password };
      const response = await axios.post(`${BASE}/login`, data, options);

      token = response.data.token;
      res(response.data);
    } catch (err) {
      rej(err);
    }
  });

const logoutUser = () =>
  new Promise(async (res, rej) => {
    try {
      const options = {
        headers: {
          "Api-Key": api_key,
          "User-Agent": user_agent,
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`${BASE}/logout`, options);
      token = null;
      res(response.data);
    } catch (err) {
      rej(err);
    }
  });

const infoUser = () =>
  new Promise(async (res, rej) => {
    try {
      const headers = {
        "Api-Key": api_key,
        "User-Agent": user_agent,
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`${BASE}/infos/user`, { headers });
      res(response.data.data);
    } catch (err) {
      rej(err);
    }
  });

// Database and Conversion
const convertSubtitle = (path) =>
  new Promise(async (res, rej) => {
    try {
      fs.createReadStream(path)
        .pipe(srt2vtt())
        .pipe(
          fs
            .createWriteStream(`${path}.vtt`)
            .on("finish", () => res(`${path}.vtt`))
        );
    } catch (err) {
      rej(err);
    }
  });

const insertEpisodeSubtitle = (path, episodeId, language, extension) =>
  new Promise((res, rej) =>
    db.run(
      `INSERT INTO subtitles (PATH, EPISODE_ID, LANG, EXT) VALUES (?,?,?,?)`,
      [path, episodeId, language, extension],
      (err) => (err ? rej(err) : res())
    )
  );

const insertMovieSubtitle = (path, mediaId, language, extension) =>
  new Promise((res, rej) =>
    db.run(
      `INSERT INTO subtitles (PATH, MEDIA_ID, LANG, EXT) VALUES (?,?,?,?)`,
      [path, mediaId, language, extension],
      (err) => (err ? rej(err) : res())
    )
  );

const deleteExisting = (id, isEpisode, language) =>
  new Promise(async (res, rej) =>
    db.run(
      `DELETE FROM subtitles
    WHERE ${isEpisode ? "EPISODE_ID" : "MEDIA_ID"} = ? AND LANG = ?`,
      [id, language],
      (err) => (err ? rej(err) : res())
    )
  );

// Exports
const searchSubtitles = (id, isEpisode, language) =>
  new Promise(async (res, rej) => {
    try {
      const { IMDB_ID } = isEpisode
        ? await queryEpisode(id, null)
        : await queryMedia(id, null);
      const options = {
        headers: {
          "Api-Key": api_key,
          "User-Agent": user_agent,
        },
      };

      const response = await axios.get(
        `${BASE}/subtitles?imdb_id=${IMDB_ID}&languages=${language}&foreign_parts_only=exclude&hearing_impaired=exclude&trusted_sources=only`,
        options
      );
      if (!response.data.data || response.data.data.length == 0) {
        throw new Error("No Results", { cause: "no results" });
      }
      const results = response.data.data;
      res(results);
    } catch (err) {
      rej(err);
    }
  });

const downloadSubtitle = (imdbId, language, fileId) =>
  new Promise(async (res, rej) => {
    try {
      await loginUser();
      const headers = {
        "Api-Key": api_key,
        "User-Agent": user_agent,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `${BASE}/download`,
        { fileId },
        { headers }
      );
      const subtitle = response.data;
      const localFilePath = `${path}/${imdbId}.${language}`;

      const download = await axios.get(subtitle.link, {
        responseType: "stream",
      });
      await logoutUser();

      download.data.pipe(
        fs.createWriteStream(localFilePath).on("finish", async () => {
          try {
            const srt = localFilePath;
            const vtt = await convertSubtitle(localFilePath);

            await deleteExisting(id, isEpisode, language);

            if (isEpisode) {
              await insertEpisodeSubtitle(srt, id, language, "srt");
              await insertEpisodeSubtitle(vtt, id, language, "vtt");
            } else {
              await insertMovieSubtitle(srt, id, language, "srt");
              await insertMovieSubtitle(vtt, id, language, "vtt");
            }

            res({ srt, vtt });
          } catch (err) {
            rej(err);
          }
        })
      );
    } catch (err) {
      rej(err);
    }
  });

const quickDowload = (id, isEpisode, language) =>
  new Promise(async (res, rej) => {
    try {
      const results = await searchSubtitles(id, isEpisode, language);
      const file_id = results[0].attributes.files[0].file_id;
      const { IMDB_ID } = isEpisode
        ? await queryEpisode(id, null)
        : await queryMedia(id, null);
      const files = await downloadSubtitle(IMDB_ID, language, file_id);
      res(files);
    } catch (err) {
      rej(err);
    }
  });

export { searchSubtitles, downloadSubtitle, quickDowload };
