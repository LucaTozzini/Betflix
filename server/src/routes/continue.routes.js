import { query_continue, exists_continue, query_continue_entry } from "../helpers/db_queries.helper.js";
import { insert_continue } from "../helpers/db_inserts.helper.js";
import { update_continue } from "../helpers/db_updates.helper.js";
import express from "express";
const router = express.Router();

router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const titles = await query_continue(user_id);
  res.json(titles);
});

router.get("/:user_id/:title_id/:episode_id", async (req, res) => {
  const {user_id, title_id, episode_id} = req.params;
  const entry = await query_continue_entry(user_id, title_id, episode_id);
  res.json(entry ?? 0);
});

router.post("/", async (req, res) => {
  let { user_id, title_id, episode_id, remaining } = req.query;
  const has = await exists_continue(user_id, title_id, episode_id);
  if(has) {
    await update_continue(user_id, title_id, episode_id, remaining);
  } else {
    await insert_continue(user_id, title_id, episode_id, remaining);
  }
  res.sendStatus(201);
});

export default router;
