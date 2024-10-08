import { readdir } from "fs/promises";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import {
  query_users,
  query_user,
} from "../helpers/db_queries.helper.js";
import { insert_user } from "../helpers/db_inserts.helper.js";
import { delete_user } from "../helpers/db_deletes.helper.js";
import { update_user } from "../helpers/db_updates.helper.js";
dotenv.config();

const router = express.Router();

router.get("/", async (req, res) => {
  const users = await query_users();
  res.json(users);
});

router.put("/user", async (req, res) => {
  const { name, image } = req.query;
  if (!name instanceof String || !image instanceof String) {
    return res.status(400).json({ message: "Missing information" });
  }
  if (name.length < 2) {
    return res.status(400).json({ message: "Name too short" });
  }
  await insert_user([name, image]);
  res.sendStatus(201);
});

router.delete("/user", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.sendStatus(400);
  }
  await delete_user(user_id);
  res.sendStatus(200);
});

router.put("/user/image", async (req, res) => {
  const {user_id, image} = req.query;
  await update_user(user_id, image);
  res.sendStatus(200);
})

router.get("/user/:user_id", async (req, res) => {
  const user = await query_user(req.params.user_id);
  if (!user) {
    return res.sendStatus(404);
  }
  res.json(user);
});

router.get("/images", async (req, res) => {
  const images = await readdir(process.env.USER_IMGS_PATH);
  res.json(images);
});

router.get("/images/:image", async (req, res) => {
  const filePath = process.env.USER_IMGS_PATH + "/" + req.params.image;
  if (!fs.existsSync(filePath)) {
    return res.sendStatus(404);
  }
  res.sendFile(filePath);
});

export default router;
