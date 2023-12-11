import fs from "fs";
import path from "path";
import env from "../../env.js";
import episode from "episode";
import { publicManager } from "./database.helpers.js";
import { db } from "../helpers/database.helpers.js";
import { haveMedia, haveEpisode } from "./queries.helpers.js";
import { getVideoDurationInSeconds } from "get-video-duration";

const parseString = (string) => {
  const split = string.split("/");
  const match = split[split.length - 1].match(/(.*)\W((19|20)\d{2})/i);
  return {
    year: parseInt(match[2]),
    title: match[1].replaceAll(/[^A-Za-z0-9\'\s]/g, " ").trim(),
  };
};

const validExt = (filename) =>
  [".mp4", ".m4v", ".mkv"].includes(path.extname(filename).toLowerCase());

const validSubExt = (fileName) =>
  [".srt", ".vtt"].includes(path.extname(fileName).toLowerCase());

const findMovieSubs = (path, isRoot) => {
  const paths = [];
  const files = fs.readdirSync(path);
  const numOfVideos = files.filter((i) => validExt(i)).length;
  if ((isRoot && numOfVideos == 1) || (!isRoot && !numOfVideos)) {
    for (const file of files) {
      if (fs.statSync(path + "/" + file).isDirectory()) {
        paths.push(...findMovieSubs(path + "/" + file, false));
      } else if (validSubExt(file)) {
        paths.push(path + "/" + file);
      }
    }
  }
  return paths;
};

const findEpisodeSubs = (path, seasonNum, episodeNum) => {
  const paths = [];
  for (const file of fs.readdirSync(path)) {
    if (fs.statSync(file).isDirectory()) {
      paths.push(...findEpisodeSubs(path + "/" + file));
    } else if (validSubExt(file)) {
      const data = episode(file);
      if (data.season == seasonNum && data.episode == episodeNum) {
        paths.push(file);
      }
    }
  }
  return paths;
};

const moviesInDirectory = (path) =>
  new Promise(async (res, rej) => {
    try {
      const files = fs.readdirSync(path);
      const paths = [];
      for (const file of files) {
        if (fs.statSync(path + "/" + file).isDirectory()) {
          paths.push(...(await moviesInDirectory(path + "/" + file)));
        } else if (validExt(file) && !(await haveMedia(path + "/" + file))) {
          paths.push(path + "/" + file);
        }
      }
      res(paths);
    } catch (err) {
      console.log("ohohoho");
      rej(err);
    }
  });

const scanMovies = () =>
  new Promise(async (res, rej) => {
    publicManager.status.ACTION = "Scan Movies";
    publicManager.status.PROGRESS = 0;
    try {
      const files = await moviesInDirectory(env.moviesPath);
      const returnArray = [];
      let i = 0;
      for (const file of files) {
        i++;
        publicManager.status.PROGRESS = (100 / files.length) * i;
        if (!(await haveMedia(`${env.moviesPath}/${file}`))) {
          try {
            const { title, year } = parseString(file);
            const duration = await getVideoDurationInSeconds(file);

            publicManager.status.ACTION = `Scan Movies - ${title} (${year})`;

            returnArray.push({
              path: file,
              title,
              year,
              duration,
            });
          } catch (err) {
            console.error(err.message);
            continue;
          }
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
      const pathSplit = folderPath.split("/");
      const folderName = pathSplit[pathSplit.length - 1];
      const folderInfo = parseString(folderName);
      const episodesPaths = await scanEpisodes(folderPath);
      if (episodesPaths.length == 0) {
        throw new Error("No new episodes");
      }
      const episodesData = [];
      for (const episodePath of episodesPaths) {
        const fileName =
          episodePath.split("/")[episodePath.split("/").length - 1];
        const episodeParse = episode(fileName);
        episodesData.push({
          path: episodePath,
          season_num: episodeParse.season,
          episode_num: episodeParse.episode,
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

const getShowFolders = () =>
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

export { scanMovies, getShowFolders, scanShow, missingMedia, missingEpisodes };
