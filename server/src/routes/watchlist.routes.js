import express from "express";
const router = express.Router();

import {
  authenticateUser,
  addWatchlist,
  removeWatchlist,
  watchlist,
} from "../helpers/users.helpers.js";

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const data = await watchlist(userId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.put(`/add`, async (req, res) => {
  try {
    const { userId, mediaId } = req.body;

    const auth = await authenticateUser(userId);
    if (!auth) {
      return res.sendStatus(401);
    }

    await addWatchlist(userId, mediaId);
    res.sendStatus(201);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.delete("/remove", async (req, res) => {
  try {
    const { userId, mediaId } = req.body;

    const auth = await authenticateUser(userId);
    if (!auth) {
      return res.sendStatus(401);
    }

    await removeWatchlist(userId, mediaId);
    res.sendStatus(202);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
