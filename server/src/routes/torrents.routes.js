import express from "express";
import {
  add_magnet,
  rem_magnet,
  from_db,
  active_torrents,
} from "../helpers/torrents.helpers.js";

const router = express.Router();

router.get("/", (req, res) => {
  const data = active_torrents();
  res.json(data);
});

router.post("/", async (req, res) => {
  const uri = req.body?.uri;
  if (!uri) return res.sendStatus(400);
  await add_magnet(uri);
  res.sendStatus(201);
});

router.delete("/", async (req, res) => {
  const { uri } = req.body;
  if (!uri) return res.sendStatus(400);
  await rem_magnet(uri);
  res.sendStatus(200);
});

router.post("/db", async (req, res) => {
  await from_db();
  res.sendStatus(201);
});

export default router;
