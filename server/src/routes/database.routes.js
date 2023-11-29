import express from "express";
import { authenticateAdmin } from "../helpers/users.helpers.js";
import {
  manager,
  setPoster,
  setPosterNt,
  setPosterWide,
  setBackdrop,
  setLogo,
} from "../helpers/database.helpers.js";

const router = express.Router();

router.get("/status", (req, res) => {
  try {
    res.json(manager.status);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/run", async (req, res) => {
  try {
    const { userId, userPin, action } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    manager.run(action);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/poster", async (req, res) => {
  try {
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) return res.sendStatus(401);
    await setPoster(mediaId, large, small);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/poster-nt", async (req, res) => {
  try {
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) return res.sendStatus(401);
    await setPosterNt(mediaId, large, small);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/poster-w", async (req, res) => {
  try {
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) return res.sendStatus(401);
    await setPosterWide(mediaId, large, small);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/backdrop", async (req, res) => {
  try {
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) return res.sendStatus(401);
    await setBackdrop(mediaId, large, small);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/logo", async (req, res) => {
  try {
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) return res.sendStatus(401);
    await setLogo(mediaId, large, small);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
