import fs from "fs";
import env from "../../env.js";
import express from "express";

import {
  addUser,
  deleteUser,
  userList,
  authenticateUser,
  userData,
  updateContinue,
  continueList,
} from "../helpers/users.helpers.js";

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const data = await userList();
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/images", async (req, res) => {
  try {
    const images = fs.readdirSync(env.userImagesPath);
    const paths = images.map((i) => `user-images/${i}`);
    res.json(paths);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/add", async (req, res) => {
  try {
    const { userName, userImage, childAccount, adminAccount, userPin } =
      req.body;

    if (isNaN(userPin) || userPin > 9999 || userPin < 0)
      return res.status(400).send("Invalid Pin");
    if (!userPin && adminAccount)
      return res.status(400).send("Admin must have a pin");

    await addUser(
      userName,
      userImage,
      childAccount || 0,
      adminAccount || 0,
      userPin || null
    );
    res.sendStatus(201);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

router.delete("/delete", async (req, res) => {
  try {
    const { userId, userPin } = req.body;
    const auth = authenticateUser(userId, userPin);
    if (!auth) {
      return res.sendStatus(401);
    }
    await deleteUser(userId);
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/data", async (req, res) => {
  try {
    const { userId, userPin } = req.body;

    const auth = await authenticateUser(userId, userPin);
    if (!auth) return res.sendStatus(401);
    const data = await userData(userId);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.post("/update-continue", async (req, res) => {
  try {
    const { userId, mediaId, episodeId, progressTime, endTime } =
      req.body;
    await updateContinue(userId, mediaId, episodeId, progressTime, endTime);
    res.sendStatus(200);
  } catch (err) {
    console.error("users/update-continue", err.message);
    res.sendStatus(500);
  }
});

router.get("/continue", async (req, res) => {
  try {
    const { userId, limit } = req.query;

    const data = await continueList(userId, limit || 30);
    res.json(data);
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
