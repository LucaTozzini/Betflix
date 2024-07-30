import express from "express";
import {
  fetch_subtitles,
  download_subtitle,
} from "../helpers/opensubtitles.helper.js";
import { query_subtitle } from "../helpers/db_queries.helper.js";
const router = express.Router();

router.get("/search", async (req, res) => {
  const { title_id, episode_id, language } = req.query;
  if (!title_id || !language) {
    return res.sendStatus(400);
  }
  const subtitles = await fetch_subtitles({ title_id, episode_id, language });
  res.json(subtitles);
});

router.get("/", async (req, res) => {
  const {title_id, episode_id, language, ext} = req.query;
  if(!title_id || !episode_id || !language || !ext) {
    return res.sendStatus(400);
  }
  const query = await query_subtitle(title_id, episode_id, language, ext);
  if(!query) {
    return res.sendStatus(404);
  }
  const {path} = query;
  
  res.sendFile(path);
})

router.put("/", async (req, res) => {
  const { title_id, language, file_id } = req.query;
  const episode_id = parseInt(req.query.episode_id);
  if (!title_id || !episode_id || !language || !file_id) {
    return res.sendStatus(400);
  }
  const download = await download_subtitle({
    title_id,
    episode_id,
    language,
    file_id,
  });
  if (!download) {
    return res.sendStatus(503);
  }
  res.sendStatus(201);
});

export default router;
