import express from "express";
import {
  publicManager,
} from "../helpers/database.helpers.js";

const router = express.Router();

router.get("/status", (req, res) => {
  try {
    const {ACTION, ACTIVE, LOGS, PROGRESS} = publicManager.status;
    res.json({ACTION, ACTIVE, LOGS, PROGRESS});
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/update/:item", async (req, res) => {
  try {
    const { item } = req.params;
    const { mediaId, large, small } = req.body;

    if (item == "poster") {
      await publicManager.images.setPoster(mediaId, large, small);
    } else if (item == "poster-nt") {
      await publicManager.images.setPosterNt(mediaId, large, small);
    } else if (item == "poster-w") {
      await publicManager.images.setPosterWide(mediaId, large, small);
    } else if (item == "backdrop") {
      await publicManager.images.setBackdrop(mediaId, large, small);
    } else if (item == "logo") {
      await publicManager.images.setLogo(mediaId, large, small);
    } else if (item == "movies") {
      publicManager.run(1);
    } else if (item == "shows") {
      publicManager.run(2);
    } else if (item == "people") {
      publicManager.run(3);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/maintenance/:action", async (req, res) => {
  try {
    const { action } = req.params;
    if (action == "clean") {
      publicManager.run(4);
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

export default router;
