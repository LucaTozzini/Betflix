import sqlite3 from "sqlite3";
import dotenv from "dotenv";
dotenv.config();

function foreignKeys() {
  return new Promise((res, rej) => {
    db_connection.run("PRAGMA foreign_keys = ON", (err) => (err ? rej(err) : res()));
  });
}

const db_connection = new sqlite3.Database(process.env.DB_PATH, sqlite3.OPEN_READWRITE, foreignKeys);
export default db_connection;

