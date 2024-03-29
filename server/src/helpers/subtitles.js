import fs from "fs";
import axios from "axios";
import env from "../../env.js";
import srt2vtt from "srt-to-vtt";
import { db } from "./database.helpers.js";

const api_key = env.OpenSubtitles_KEY;
const username = env.OpenSubtitles_username;
const password = env.OpenSubtitles_password;
const path = env.subtitlesPath;
const BASE = "https://api.opensubtitles.com/api/v1";
const user_agent = "BetflixDev";

let token = null;

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

const insertSubtitle = (path, imdbId, language, extension) =>
  new Promise((res, rej) =>
    db.run(
      `INSERT INTO subtitles (PATH, IMDB_ID, LANG, EXT) 
      VALUES (?,?,?,?)`,
      [path, imdbId, language, extension],
      (err) => (err ? rej(err) : res())
    )
  );

const deleteExisting = (imdbId, language) =>
  new Promise(async (res, rej) =>
    db.run(
      `DELETE FROM subtitles
      WHERE IMDB_ID = ? AND LANG = ?`,
      [imdbId, language],
      (err) => (err ? rej(err) : res())
    )
  );

// API Requests
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

const searchSubtitles = ({ imdbId, parentImdbId, language }) =>
  new Promise(async (res, rej) => {
    try {
      const options = {
        headers: {
          "Api-Key": api_key,
          "User-Agent": user_agent,
        },
      };
      const response = await axios.get(
        `${BASE}/subtitles?imdb_id=${imdbId}${
          parentImdbId ? `&parent_imdb_id=${parentImdbId}` : ""
        }&languages=${language}&foreign_parts_only=exclude&trusted_sources=only`,
        options
      );
      if (response.data.data?.length === 0) {
        throw new Error("No Results", { cause: "no results" });
      }
      const results = response.data.data;
      res(results);
    } catch (err) {
      rej(err);
    }
  });

// Download functions

const downloadSubtitle = (imdbId, language, fileId) =>
  new Promise(async (res, rej) => {
    try {
      const { token } = await loginUser();

      const headers = {
        "Api-Key": api_key,
        "User-Agent": user_agent,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `${BASE}/download`,
        { file_id: fileId },
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
            await deleteExisting(imdbId, language);
            await insertSubtitle(srt, imdbId, language, "srt");
            await insertSubtitle(vtt, imdbId, language, "vtt");

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

const quickDowload = ({ imdbId, parentImdbId, language }) =>
  new Promise(async (res, rej) => {
    try {
      console.log("Quick Download ==>", imdbId, parentImdbId, language);
      const results = await searchSubtitles({ imdbId, parentImdbId, language });
      console.log(results.length, "Hits");
      const { file_id } = results[0].attributes.files[0];
      console.log("File Id ==>", file_id);
      const files = await downloadSubtitle(imdbId, language, file_id);
      console.log("Download Finished");
      res(files);
    } catch (err) {
      rej(err);
    }
  });

export { searchSubtitles, downloadSubtitle, quickDowload };
