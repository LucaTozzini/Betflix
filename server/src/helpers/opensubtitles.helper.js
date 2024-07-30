import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import { unlink } from "fs/promises";

import srt2vtt from "srt-to-vtt";
import dotenv from "dotenv";
import { insert_subtitle } from "./db_inserts.helper.js";
import { delete_subtitle } from "./db_deletes.helper.js";
dotenv.config();

const api_key = process.env.OPENSUB_KEY;
const username = process.env.OPENSUB_USERNAME;
const password = process.env.OPENSUB_PASSWORD;
const user_agent = process.env.OPENSUB_USERAGENT;
const subtitles_path = process.env.SUBTITLES_PATH;
const BASE = "https://api.opensubtitles.com/api/v1";

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

async function login_user() {
  const options = {
    method: "POST",
    headers: {
      "Api-Key": api_key,
      "User-Agent": user_agent,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  };
  const response = await fetch(`${BASE}/login`, options);
  if (response.ok) {
    const { token } = await response.json();
    return token;
  }
  console.error("login_user request fail", response.status);
}

async function fetch_download_link(file_id) {
  const token = await login_user();
  if (!token) {
    return;
  }

  const options = {
    method: "POST",
    headers: {
      "Api-Key": api_key,
      "User-Agent": user_agent,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ file_id }),
  };

  const response = await fetch(`${BASE}/download`, options);
  if (response.ok) {
    const { link } = await response.json();
    return link;
  }
  console.error("fetch_download_link request fail", response.status);
}

// title_id ==> imdb
// episode_id ==> tmdb
export async function fetch_subtitles({ title_id, episode_id, language }) {
  const options = {
    headers: {
      "Api-Key": api_key,
      "User-Agent": user_agent,
    },
  };
  let query;
  if (episode_id) {
    query = `${BASE}/subtitles?parent_imdb_id=${title_id}&tmdb_id=${episode_id}&languages=${language}`;
  } else {
    query = `${BASE}/subtitles?imdb_id=${title_id}&languages=${language}`;
  }
  const response = await fetch(query, options);
  if (response.ok) {
    const { data } = await response.json();
    return data.map((i) => i.attributes.files[0]);
  }
  console.error("fetch_subtitles request fail", response.status);
}

export async function download_subtitle({
  title_id,
  episode_id,
  language,
  file_id,
}) {
  const link = await fetch_download_link(file_id);
  if (!link) {
    return;
  }

  const response = await fetch(link);

  if (!fs.existsSync(subtitles_path)) {
    return;
  }

  if (response.ok) {
    await delete_subtitle([title_id, episode_id, language]);

    const filePath = `${subtitles_path}/sub_ti_${title_id}_ei_${episode_id}_lng_${language}.srt`;
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }

    const fileStream = fs.createWriteStream(filePath, { flags: "wx" });
    await finished(Readable.fromWeb(response.body).pipe(fileStream));

    const filePathVtt = await convertSubtitle(filePath);
    await insert_subtitle([filePath, title_id, episode_id, language, "srt"]);
    await insert_subtitle([filePathVtt, title_id, episode_id, language, "vtt"]);
    return 1;
  }

  console.error("download_subtitle request fail", response.status);
}
