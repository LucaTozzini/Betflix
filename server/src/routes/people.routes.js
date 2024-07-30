import express from "express";
import {
  query_people_search,
  query_filmography,
  query_person,
} from "../helpers/db_queries.helper.js";

const router = express.Router();

router.get("/person/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const person = await query_person(person_id);
  res.json(person);
});

router.get("/search", async (req, res) => {
  const { name } = req.query;
  const people = await query_people_search(name);
  res.json(people);
});

router.get("/filmography/:person_id", async (req, res) => {
  const { person_id } = req.params;
  const movies = await query_filmography(person_id);
  res.json(movies);
});

export default router;
