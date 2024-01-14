import express from "express";
import {
  queryMedia,
  queryMediaPath,
  queryEpisode,
  querySubtitlePath,
  availableSubtitles,
} from "../helpers/queries.helpers.js";
import {
  findMovieSubs,
  findEpisodeSubs,
} from "../helpers/filesUtil.helpers.js";
import {
  searchSubtitles,
  downloadSubtitle,
  quickDowload,
} from "../helpers/OpenSubtitles-api.js";

const router = express.Router();

router.get("/", async (req, res) => {
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
    let path = await querySubtitlePath(
      imdbId,
      language || "en",
      extension || "vtt"
    );

    // if (!path) {
    //   const files = await quickDowload(
    //     isEpisode ? episodeId : mediaId,
    //     isEpisode,
    //     language || "en"
    //   );
    //   path = extension == "vtt" ? files.vtt : files.srt;
    // }
    if (!path) {
      return res.sendStatus(404);
    }
    res.sendFile(path);
  } catch (err) {
    console.log(err.message);
    if (err.cause == "no results") {
      return res.sendStatus(404);
    }
    res.sendStatus(500);
  }
});

router.get("/available", async (req, res) => {
  try {
    const { imdbId } = req.query;
    if (!imdbId) {
      return res.sendStatus(400);
    }
    const data = await availableSubtitles(imdbId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/search", async (req, res) => {
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

router.get("/download", async (req, res) => {
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

router.get("/local", async (req, res) => {
  try {
    const { mediaId, episodeId } = req.query;
    if (!mediaId) {
      return res.sendStatus(400);
    }
    const { TYPE } = await queryMedia(mediaId);
    if (TYPE == 2 && isNaN(parseInt(episodeId))) {
      return res.sendStatus(400);
    }
    let path = await queryMediaPath(mediaId);
    let data;
    if (TYPE == 1) {
      path = path.replace(/[\/\\][^\/\\]*$/i, "");
      data = await findMovieSubs(path, true);
    } else {
      const { SEASON_NUM, EPISODE_NUM } = await queryEpisode(episodeId);
      data = await findEpisodeSubs(path, SEASON_NUM, EPISODE_NUM);
    }
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;