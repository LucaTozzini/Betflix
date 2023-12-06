import fs from "fs";
import env from "../../env.js";
import send from "send";
import express from "express";
import {
  authenticateUser,
  currentEpisode,
  movieResumeTime,
  episodeResumeTime,
} from "../helpers/users.helpers.js";
import {
  queryMedia,
  queryNextEpisode,
  querySubtitlePath,
  availableEpisodeSubtitles,
  availableMovieSubtitles,
  queryMediaPath,
  queryEpisodePath,
} from "../helpers/queries.helpers.js";
import {
  searchSubtitles,
  downloadSubtitle,
  quickDowload,
} from "../helpers/OpenSubtitles-api.js";

const router = express.Router();

router.get("/stream", async (req, res) => {
  try {
    if (!req.headers.range) {
      req.headers.range = "bytes=0-";
    }

    const { type, mediaId, episodeId } = req.query;
    if (type != 1 && type != 2) {
      return res.status(400).send("Invalid type");
    }

    const filePath =
      type == 1
        ? await queryMediaPath(mediaId)
        : await queryEpisodePath(episodeId);

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    const size = fs.statSync(filePath).size;
    const chunk = 10 ** 6;

    const start = parseInt(
      req.headers.range.replace(/bytes=/, "").split("-")[0]
    );

    const end = Math.min(start + chunk, size - 1);

    const contentLength = end - start + 1;

    const headers = {
      "Content-Length": contentLength,
      "Accept-Ranges": "bytes",
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
  } catch (err) {
    console.error(err.message);
  }
});

router.get("/video", async (req, res) => {
  try {
    const { type, mediaId, episodeId } = req.query;
    if (type != 1 && type != 2) {
      return res.status(400).send("Invalid type");
    }
    const filePath =
      type == 1
        ? await queryMediaPath(mediaId)
        : await queryEpisodePath(episodeId);
    if (!filePath) {
      return res.status(404).send("File not found :(");
    }
    const stream = send(req, filePath);
    stream.pipe(res);
  } catch (err) {
    console.error(err);
  }
});

router.post("/current-episode", async (req, res) => {
  try {
    const { userId, userPin, mediaId } = req.body;
    const auth = await authenticateUser(userId, userPin);
    if (!auth) {
      res.sendStatus(401);
      return;
    }
    const data = await currentEpisode(userId, mediaId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/resume", async (req, res) => {
  try {
    const { userId, userPin, mediaId, episodeId } = req.body;

    const auth = await authenticateUser(userId, userPin);
    if (!auth) return res.sendStatus(401);

    const data = episodeId
      ? await episodeResumeTime(userId, episodeId)
      : await movieResumeTime(userId, mediaId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/next", async (req, res) => {
  try {
    const { episodeId } = req.body;
    if (!episodeId) {
      return res.sendStatus(400);
    }
    const { MEDIA_ID, SEASON_NUM, EPISODE_NUM } = await queryMedia(episodeId);
    const next = await queryNextEpisode(MEDIA_ID, SEASON_NUM, EPISODE_NUM);
    res.json(next);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/subtitles", async (req, res) => {
  try {
    if (!fs.existsSync(env.subtitlesPath)) {
      return res.status(503).json({
        error: "Subtitles path not found, make sure needed drive is mounted",
      });
    }
    const { imdbId, language, extension } = req.query;
    if (!imdbId) {
      return res.sendStatus(400);
    }
    let path = await querySubtitlePath(imdbId, language || "en", extension || "vtt");

    // if (!path) {
    //   const files = await quickDowload(
    //     isEpisode ? episodeId : mediaId,
    //     isEpisode,
    //     language || "en"
    //   );
    //   path = extension == "vtt" ? files.vtt : files.srt;
    // }

    res.sendFile(path);
  } catch (err) {
    console.log(err.message);
    if (err.cause == "no results") {
      return res.sendStatus(404);
    }
    res.sendStatus(500);
  }
});

router.get("/subtitles/available", async (req, res) => {
  try {
    const { mediaId, episodeId } = req.query;
    const isEpisode = !isNaN(episodeId);
    if (!mediaId && !isEpisode) {
      return res.sendStatus(400);
    }
    const data = isEpisode
      ? await availableEpisodeSubtitles(episodeId)
      : await availableMovieSubtitles(mediaId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/subtitles/search", async (req, res) => {
  try {
    const { mediaId, episodeId, language } = req.query;
    const isEpisode = !isNaN(episodeId);
    if (!language || (!mediaId && !isEpisode)) {
      return res.sendStatus(400);
    }
    const data = await searchSubtitles(
      isEpisode ? episodeId : mediaId,
      isEpisode,
      language
    );
    res.json(data);
  } catch (err) {
    if (err.cause == "no results") {
      return res.sendStatus(404);
    }
    res.sendStatus(500);
  }
});

router.get("/subtitles/download", async (req, res) => {
  try {
    const { mediaId, episodeId, language, fileId, extension } = req.query;
    const isEpisode = !isNaN(episodeId);
    if (!fileId || (!mediaId && !isEpisode) || !language || !extension) {
      return res.sendStatus(400);
    }
    const data = await downloadSubtitle(
      isEpisode ? episodeId : mediaId,
      isEpisode,
      language,
      fileId
    );
    res.sendFile(extension == "vtt" ? data.vtt : data.srt);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
