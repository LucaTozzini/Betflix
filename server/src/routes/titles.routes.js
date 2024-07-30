import express from "express";
import {
  query_title,
  query_title_genres,
  query_titles_voted,
  query_titles_latest,
  query_cast,
  query_episodes,
  query_available_seasons,
  query_titles_search,
  query_similar_titles,
} from "../helpers/db_queries.helper.js";

const router = express.Router();

router.get("/title/:title_id", async (req, res) => {
  const { title_id } = req.params;
  const title = await query_title(title_id);
  title.genres = await query_title_genres(title_id);
  title.cast = await query_cast(title_id);
  res.json(title);
});

router.get("/title/:title_id/seasons/available", async (req, res) => {
  const { title_id } = req.params;
  const available = await query_available_seasons(title_id);
  res.json(available);
});

router.get("/title/:title_id/seasons/:season_num", async (req, res) => {
  const { title_id, season_num } = req.params;
  const episodes = await query_episodes(title_id, season_num);
  res.json(episodes);
});

router.get("/title/:title_id/similar", async (req, res) => {
  const { title_id } = req.params;
  const similarTitles = await query_similar_titles(title_id);
  res.json(similarTitles);
});

router.get("/latest", async (req, res) => {
  const titles = await query_titles_latest();
  res.json(titles);
});

router.get("/voted", async (req, res) => {
  const titles = await query_titles_voted();
  res.json(titles);
});

router.get("/search", async (req, res) => {
  const { title } = req.query;
  if (!title?.length) {
    return res.sendStatus(400);
  }
  const titles = await query_titles_search(title);
  res.json(titles);
});

export default router;
