import fs from "fs";
import path from "path";
import env from "../../env.js";
import episode from "episode";
import { publicManager } from "./database.helpers.js";
import { db } from "../helpers/database.helpers.js";
import { haveMedia, haveEpisode } from "./queries.helpers.js";
import { getVideoDurationInSeconds } from "get-video-duration";

const parseString = (string) =>
  new Promise(async (res, rej) => {
    try {
      const split = string.split("/")
      const match = split[split.length - 1].match(/(.*)\W((19|20)\d{2})/i);
      res({ year: parseInt(match[2]), title: match[1].replaceAll(/\W/g, " ").trim() });
    } catch (err) {
      console.log(err.message);
      rej(err);
    }
  });

const validExt = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return [".mp4", ".m4v", ".mkv"].includes(ext);
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
            const parse = await parseString(file);
            console.log(parse);
            continue;
            returnArray.push({
              path: `${env.moviesPath}/${file}`,
              title: parseString(file).title,
              year: parseString(file).year,
              duration: await getVideoDurationInSeconds(
                `${env.moviesPath}/${file}`
              ),
            });
          } catch (err) {
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
      const folderInfo = parseString(
        folderPath.split("/")[folderPath.split("/").length - 1]
      );
      const episodesPaths = await scanEpisodes(folderPath);
      if (episodesPaths.length == 0) {
        throw new Error("No new episodes");
      }
      const episodesData = [];
      for (const episodePath of episodesPaths) {
        const fileName =
          episodePath.split("/")[episodePath.split("/").length - 1];
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
