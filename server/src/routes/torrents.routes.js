import express from "express";
import {
  addMagnet,
  activeTorrents,
  addFromDB,
} from "../helpers/torrents.helpers.js";

const router = express.Router();

router.post("/add", (req, res) => {
  try {
    const { magnetURI } = req.body;
    if (!magnetURI) {
      return res.sendStatus(400);
    }
    addMagnet(magnetURI);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/addDB", (req, res) => {
  try {
    addFromDB();
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/active", (req, res) => {
  try {
    const data = activeTorrents();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
