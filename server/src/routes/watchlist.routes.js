import { query_watchlist_titles } from "../helpers/db_queries.helper.js";
import { insert_watchlist } from "../helpers/db_inserts.helper.js"
import { delete_watchlist } from "../helpers/db_deletes.helper.js";
import express from "express";
const router = express.Router();

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const titles = await query_watchlist_titles(user_id);
  res.json(titles);
});

router.put("/", async (req, res) => {
  const {user_id, title_id} = req.query;
  await insert_watchlist(user_id, title_id);
  res.sendStatus(201);
});

router.delete("/", async (req, res) => {
  const {user_id, title_id} = req.query;
  await delete_watchlist(user_id, title_id);
  res.sendStatus(200);
});

export default router;
