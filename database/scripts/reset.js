import sqlite3 from "sqlite3";
import dotenv from "dotenv";
dotenv.config();
const db = new sqlite3.Database(
  process.env.DB_PATH,
  sqlite3.OPEN_READWRITE,
  onOpen
);

async function onOpen(err) {
  if (err) {
    throw new Error(err.message);
  }
  dropTables();
}

function dropTables() {
  db.exec(
    `
    DROP TABLE IF EXISTS collections;
    DROP TABLE IF EXISTS titles;
    DROP TABLE IF EXISTS episodes;
    DROP TABLE IF EXISTS genres;
    DROP TABLE IF EXISTS people;
    DROP TABLE IF EXISTS cast;
    DROP TABLE IF EXISTS directors;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS continue;
    DROP TABLE IF EXISTS watchlist;
    DROP TABLE IF EXISTS subtitles;
    DROP TABLE IF EXISTS torrents;
    `
  );
}