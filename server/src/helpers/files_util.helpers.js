import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import episode from "episode";
import { exists_title_path, exists_episode_path } from "./db_queries.helper.js";
import { getVideoDurationInSeconds } from "get-video-duration";
import { STATUS } from "./db_manager.helper.js";
dotenv.config();

const parseString = (string, folder) => {
  try {
    const split = string.split("/");
    const fileName = split[split.length - 1];
    let titleRaw;
    if (folder) {
      titleRaw = fileName.match(/(^.+?)(?=(19|20)\d{2}[^p]|\d{3,4}p|$)/g)[0];
    } else {
      titleRaw = fileName.match(
        /(^.+?)(?=(19|20)\d{2}[^p]|\d{3,4}p|\.[^.]*$)/g
      )[0];
    }
    if (!titleRaw) {
      return -1;
    }

    const title = titleRaw
      .replaceAll(/[^A-Z0-9]/gi, " ")
      .trim()
      .replaceAll(/\s{2,}/g, " ");
    const year = fileName.replace(titleRaw, "").match(/(?:19|20)\d{2}/g);

    return {
      title,
      year: year ? parseInt(year[0]) : -1,
    };
  } catch (err) {
    return -1;
  }
};

export const validExt = (filename) =>
  [".mp4", ".m4v", ".mkv"].includes(path.extname(filename).toLowerCase());

export const validSubExt = (fileName) =>
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
    if (fs.statSync(path + "/" + file).isDirectory()) {
      paths.push(...findEpisodeSubs(path + "/" + file, seasonNum, episodeNum));
    } else if (validSubExt(file)) {
      const data = episode(file);
      if (data.season === seasonNum && data.episode === episodeNum) {
        paths.push(file);
      }
    }
  }
  return paths;
};

async function moviesInDirectory(path) {
  const files = fs.readdirSync(path);
  const paths = [];
  for (const file of files) {
    if (fs.statSync(path + "/" + file).isDirectory()) {
      paths.push(...(await moviesInDirectory(path + "/" + file)));
    } else if (
      validExt(file) &&
      !(await exists_title_path(path + "/" + file))
    ) {
      paths.push(path + "/" + file);
    }
  }
  return paths;
}

async function scan_episodes(folderPath) {
  const items = fs.readdirSync(folderPath);
  const returnArray = [];
  for (const item of items) {
    const itemPath = folderPath + "/" + item;
    if (fs.statSync(itemPath).isDirectory()) {
      returnArray.push(...(await scan_episodes(itemPath)));
    } else {
      if (validExt(item)) {
        if (!(await exists_episode_path(itemPath))) {
          returnArray.push(itemPath);
        }
      }
    }
  }

  return returnArray;
}

export async function scan_movies() {
  STATUS.ACTIVE_SUBTASK = "scanning movies";
  const moviesExist = fs.existsSync(process.env.MOVIES_PATH);
  if (!moviesExist) {
    throw new Error("scan_movies Error: moviesPath doesn't exist");
  }
  const filePaths = await moviesInDirectory(process.env.MOVIES_PATH);
  const fileObjects = [];
  for (const [index, filePath] of filePaths.entries()) {
    STATUS.SUBTASK_PROGRESS = index / (filePaths.length - 1);

    const parse = parseString(filePath, false);
    if (parse === -1) {
      console.error("parseString fail", filePath);
      continue;
    }
    const { title, year } = parse;
    const duration = await getVideoDurationInSeconds(filePath);
    fileObjects.push({
      path: filePath,
      title,
      year,
      duration,
    });
  }
  return fileObjects;
}

export async function scan_show(folderPath) {
  STATUS.
  ACTIVE_SUBTASK = "scanning show";
  if (!fs.statSync(folderPath).isDirectory()) {
    throw new Error("Invalid path");
  }
  const pathSplit = folderPath.split("/");
  const folderName = pathSplit[pathSplit.length - 1];
  const folderInfo = parseString(folderName, true);
  if (folderInfo === -1) {
    throw new Error("parseString Error: Can't parse folder name");
  }

  const episodesPaths = await scan_episodes(folderPath);
  if (episodesPaths.length === 0) {
    return -1;
  }
  const episodesData = [];
  for (const [index, episodePath] of episodesPaths.entries()) {
    STATUS.SUBTASK_PROGRESS = index / (episodesPaths.length - 1);
    const fileName = episodePath.split("/")[episodePath.split("/").length - 1];
    const episodeParse = episode(fileName);
    episodesData.push({
      path: episodePath,
      season_num: episodeParse.season,
      episode_num: episodeParse.episode,
      duration: await getVideoDurationInSeconds(episodePath),
    });
  }

  return {
    path: folderPath,
    title: folderInfo.title,
    year: folderInfo.year,
    episodes: episodesData,
  };
}

/**
 * @returns {Promise<[folder: string]>}
 */
export async function show_folders() {
  const showsExists = fs.existsSync(process.env.SHOWS_PATH);
  if (!showsExists) {
    throw new Error("showsPath doesn't exist");
  }
  const showFolders = fs
    .readdirSync(process.env.SHOWS_PATH)
    .filter((folderName) =>
      fs.statSync(process.env.SHOWS_PATH + "/" + folderName).isDirectory()
    )
    .map((i) => process.env.SHOWS_PATH + "/" + i);
  return showFolders;
}
