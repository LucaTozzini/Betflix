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
  routine();
}

function routine() {
  db.exec(
    `
    DELETE FROM torrents;
    `
  );
}
