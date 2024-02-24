import express from "express";
import { fetchImages } from "../helpers/TMDb-api.helpers.js";
import {
  authenticateUser,
  inWatchlist,
  watchAgain,
} from "../helpers/users.helpers.js";
import {
  availableGenres,
  queryMediaByGenre,
  queryMedia,
  queryPerson,
  querySeason,
  queryEpisode,
  queryFilmography,
  queryByDirector,
  queryVoteRange,
  queryDateRange,
  querylatestReleases,
} from "../helpers/queries.helpers.js";

const router = express.Router();

// Global Media
router.get("/item", async (req, res) => {
  try {
    const { mediaId, userId } = req.query;

    const data = await queryMedia(mediaId, userId);
    data["IN_WATCHLIST"] = await inWatchlist(userId, mediaId);

    res.json(data);
  } catch (err) {
    console.error("/browse/item", err.message);
    res.sendStatus(500);
  }
});

router.get("/range/vote", async (req, res) => {
  try {
    let { minVote, maxVote, orderBy, limit } = req.query;
    minVote = parseFloat(minVote);
    maxVote = parseFloat(maxVote);
    limit = parseInt(limit);

    if (isNaN(minVote) || isNaN(maxVote)) {
      return res.sendStatus(400);
    }
    const data = await queryVoteRange(minVote, maxVote, orderBy, limit);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/range/date", async (req, res) => {
  try {
    const { startDate, endDate, orderBy, limit } = req.query;

    if (!startDate || !endDate) {
      return res.sendStatus(400);
    }
    const data = await queryDateRange(startDate, endDate, orderBy, limit || 30);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/genres/available", async (req, res) => {
  try {
    const data = await availableGenres();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/genres", async (req, res) => {
  try {
    const { genreName, type, orderBy, limit } = req.query;
    if (!genreName) {
      return res.sendStatus(400);
    }
    const data = await queryMediaByGenre(genreName, type, orderBy, limit || 30);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/latest/releases", async (req, res) => {
  try {
    const { limit } = req.query;
    const data = await querylatestReleases(limit || 30);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// Shows
router.get("/season", async (req, res) => {
  try {
    const { userId, mediaId, seasonNum } = req.query;

    if (isNaN(seasonNum) || !mediaId) {
      return res.sendStatus(400);
    }

    const EPISODES = await querySeason(mediaId, seasonNum, userId);
    const data = { SEASON_NUM: seasonNum, EPISODES };
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/episode", async (req, res) => {
  try {
    const { episodeId, userId } = req.query;
    const data = await queryEpisode(episodeId, userId);
    console.log(episodeId, userId,data);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// People
router.get("/person", async (req, res) => {
  try {
    const { personId } = req.query;
    const data = await queryPerson(personId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/person/filmography", async (req, res) => {
  try {
    const { personId } = req.query;
    const data = await queryFilmography(personId);
    res.json(data);
  } catch (err) {
    console.error("/browse/person/filmography", err.message);
    res.sendStatus(500);
  }
});

router.get("/person/directed", async (req, res) => {
  try {
    const { personId } = req.query;
    const data = await queryByDirector(personId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// User
router.post("user/watched", async (req, res) => {
  try {
    const { userId, userPin, limit } = req.body;
    const auth = await authenticateUser(userId, userPin);
    if (!auth) return res.sendStatus(401);
    const data = await watchAgain(userId, limit);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// Images
router.get("/images", async (req, res) => {
  try {
    const { mediaId } = req.query;
    const data = await fetchImages(mediaId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
