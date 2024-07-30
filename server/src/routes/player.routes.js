import send from "send";
import express from "express";
import { query_title, query_episode } from "../helpers/db_queries.helper.js";
const router = express.Router();

router.get("/stream/:type/:id", async (req, res) => {
  const { type, id } = req.params;
  if (type != 1 && type != 2) {
    return res.status(400).send("Invalid Type");
  }

  const data = type == 1 ? await query_title(id) : await query_episode(id);
  if (!data) {
    return res.status(404).send("File Not Found");
  }

  const stream = send(req, data.path);
  stream.pipe(res);
});

export default router;
