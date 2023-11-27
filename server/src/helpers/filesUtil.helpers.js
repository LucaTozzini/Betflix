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
  return ext == ".mp4" || ext == ".m4v";
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

const scanShows = () =>
  new Promise(async (res, rej) => {
    manager.status.ACTION = "Scan Shows";
    manager.status.PROGRESS = 0;
    try {
      const folders = fs.readdirSync(env.showsPath);
      const returnArray = [];

      let i = 0;
      for (const folder of folders) {
        i++;
        if (!fs.statSync(`${env.showsPath}/${folder}`).isDirectory()) continue;
        manager.status.PROGRESS = (100 / folders.length) * i;

        const path = `${env.showsPath}/${folder}`;
        const string = parseString(folder);

        const episodesFiles = fs
          .readdirSync(path)
          .filter((file) => validExt(file));
        const episodesArray = [];

        for (const file of episodesFiles) {
          if (!(await haveEpisode(`${path}/${file}`))) {
            episodesArray.push({
              path: `${path}/${file}`,
              season_num: episode(file).season,
              episode_num: episode(file).episode,
              duration: await getVideoDurationInSeconds(`${path}/${file}`),
            });
          }
        }

        returnArray.push({
          path,
          title: string.title,
          year: string.year,
          episodes: episodesArray,
        });
      }
      res(returnArray.filter((i) => i.episodes.length > 0));
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

export { scanMovies, scanShows, getMoviePath, getEpisodePath };
