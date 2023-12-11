import express from "express";
import { queryPersonByName, queryTitle } from "../helpers/queries.helpers.js";
const router = express.Router();

router.get("/title", async (req, res) => {
    try {
      let { value, limit } = req.query;
      if (!value) {
        return res.status(400).send("Value empty");
      }
      limit = parseInt(limit);
      const data = await queryTitle(value, isNaN(limit) ? 30 : limit);
      res.json(data);
    } catch (err) {
      console.error(err.message);
      res.sendStatus(500);
    }
  });
  
  router.get("/person", async (req, res) => {
    try {
      let { value, limit } = req.query;
      limit = parseInt(limit);
      if(!value.match(/\w/g)) {
        return res.sendStatus(400);
      }
      const data = await queryPersonByName(value, isNaN(limit) ? 30 : limit);
      res.json(data);
    } catch (err) {
      console.error(err.message);
      res.sendStatus(500);
    }
  });

export default router;