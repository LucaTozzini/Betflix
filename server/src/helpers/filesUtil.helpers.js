import fs from "fs";
import path from "path";
import episode from "episode";
import env from "../../env.js";
import { manager } from "./database.helpers.js";
import { db } from "../helpers/database.helpers.js";
import { haveMedia, haveEpisode } from "./queries.helpers.js";
import { getVideoDurationInSeconds } from "get-video-duration";

const parseString = (string) => {
  const regex = /\[(\d{4})\].*/;
  const match = string.match(regex);
  if (!match) return false;

  const year = match[1];
  const title = string
    .replace(regex, "")
    .replace(/[^A-Za-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { year, title };
};

const validExt = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return [".mp4", ".m4v", ".mkv"].includes(ext);
};

const scanMovies = () =>
  new Promise(async (res, rej) => {
    manager.status.ACTION = "Scan Movies";
    manager.status.PROGRESS = 0;
    try {
      const files = fs
        .readdirSync(env.moviesPath)
        .filter((filename) => validExt(filename));
      const returnArray = [];
      let i = 0;
      for (const file of files) {
        i++;
        manager.status.PROGRESS = (100 / files.length) * i;
        if (!(await haveMedia(`${env.moviesPath}/${file}`))) {
          returnArray.push({
            path: `${env.moviesPath}/${file}`,
            title: parseString(file).title,
            year: parseString(file).year,
            duration: await getVideoDurationInSeconds(
              `${env.moviesPath}/${file}`
            ),
          });
        }
      }
      res(returnArray);
    } catch (err) {
      rej(err);
    }
  });

const scanEpisodes = (folderPath) =>
  new Promise(async (res, rej) => {
    try {
      const items = fs.readdirSync(folderPath);
      const returnArray = [];
      for (const item of items) {
        const itemPath = folderPath + "/" + item;
        if (fs.statSync(itemPath).isDirectory()) {
          returnArray.push(...(await scanEpisodes(itemPath)));
        } else {
          if (validExt(item)) {
            if (!(await haveEpisode(itemPath))) {
              returnArray.push(itemPath);
            }
          }
        }
      }

      res(returnArray);
    } catch (err) {
      rej(err);
    }
  });

const scanShow = (folderPath) =>
  new Promise(async (res, rej) => {
    try {
      if (!fs.statSync(folderPath).isDirectory()) {
        throw new Error("Invalid path");
      }
      const folderInfo = parseString(
        folderPath.split("/")[folderPath.split("/").length - 1]
      );
      const episodesPaths = await scanEpisodes(folderPath);
      if (episodesPaths.length == 0) {
        throw new Error("No new episodes");
      }
      const episodesData = [];
      for (const episodePath of episodesPaths) {
        const fileName = episodePath.split("/")[episodePath.split("/").length - 1];
        episodesData.push({
          path: episodePath,
          season_num: episode(fileName).season,
          episode_num: episode(fileName).episode,
          duration: await getVideoDurationInSeconds(episodePath),
        });
      }

      res({
        path: folderPath,
        title: folderInfo.title,
        year: folderInfo.year,
        episodes: episodesData,
      });
    } catch (err) {
      rej(err);
    }
  });

const getShowsFolders = () =>
  new Promise(async (res, rej) => {
    try {
      const showFolders = fs
        .readdirSync(env.showsPath)
        .filter((folderName) =>
          fs.statSync(env.showsPath + "/" + folderName).isDirectory()
        );
      res(showFolders);
    } catch (err) {
      rej(err);
    }
  });

const getMoviePath = (mediaId) =>
  new Promise((res, rej) =>
    db.get(
      "SELECT PATH FROM media_main WHERE MEDIA_ID = ?",
      [mediaId],
      (err, row) => (err ? rej(err) : res(row ? row.PATH : undefined))
    )
  );

const getEpisodePath = (episodeId) =>
  new Promise((res, rej) =>
    db.get(
      `SELECT PATH FROM episodes_main WHERE EPISODE_ID = ?`,
      [episodeId],
      (err, row) => (err ? rej(err) : res(row ? row.PATH : undefined))
    )
  );

const missingMedia = () =>
  new Promise((res, rej) =>
    db.all("SELECT PATH FROM media_main", (err, rows) =>
      err
        ? rej(err)
        : res(rows.filter((i) => !fs.existsSync(i.PATH)).map((i) => i.PATH))
    )
  );

const missingEpisodes = () =>
  new Promise((res, rej) =>
    db.all("SELECT PATH FROM episodes_main", (err, rows) =>
      err
        ? rej(err)
        : res(rows.filter((i) => !fs.existsSync(i.PATH)).map((i) => i.PATH))
    )
  );

export {
  scanMovies,
  getShowsFolders,
  scanShow,
  getMoviePath,
  getEpisodePath,
  missingMedia,
  missingEpisodes,
};
