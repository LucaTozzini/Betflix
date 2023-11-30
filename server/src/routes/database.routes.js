import express from "express";
import { authenticateAdmin } from "../helpers/users.helpers.js";
import { publicManager } from "../helpers/database.helpers.js";

const router = express.Router();

router.get("/status", (req, res) => {
  try {
    res.json(publicManager.status);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/update/:item", async (req, res) => {
  try {
    const { item } = req.params;
    const { userId, userPin, mediaId, large, small } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) {
      return res.sendStatus(401);
    }

    if (item == "poster") {
      await publicManager.images.setPoster(mediaId, large, small);
    } else if ("poster-nt") {
      await publicManager.images.setPosterNt(mediaId, large, small);
    } else if ("/poster-w") {
      await publicManager.images.setPosterWide(mediaId, large, small);
    } else if ("backdrop") {
      await publicManager.images.setBackdrop(mediaId, large, small);
    } else if ("logo") {
      await publicManager.images.setLogo(mediaId, large, small);
    } else if ("movies") {
      publicManager.run(1);
    } else if ("shows") {
      publicManager.run(2);
    } else if ("people") {
      publicManager.run(3);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.post("/maintanace/:action", async (req, res) => {
  try {
    const { action } = req.params;
    const { userId, userPin } = req.body;
    const auth = await authenticateAdmin(userId, userPin);
    if (!auth) {
      return res.sendStatus(401);
    }

    if(action == "clean") {
      publicManager.run(4);
    }
    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

export default router;
