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
  await foreignKeys();
  createTables();
}

function foreignKeys() {
  return new Promise((res, rej) => {
    db.run("PRAGMA foreign_keys = ON", (err) => (err ? rej(err) : res()));
  });
}

function createTables() {
  db.exec(
    `
    CREATE TABLE collections (
      collection_id INTEGER NOT NULL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      overview VARCHAR(255),
      poster VARCHAR(255),
      backdrop VARCHAR(255)
    );

    CREATE TABLE titles (
      title_id VARCHAR(255) NOT NULL PRIMARY KEY,
      tmdb_id INTEGER NOT NULL,

      type INTEGER NOT NULL,
      path VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      overview VARCHAR(500),
      rating VARCHAR(255) DEFAULT 'NR',
      vote INT,
      duration INT,
      collection_id INT,
      budget INT,
      revenue INT,
      date DATE,
      
      poster VARCHAR(255),
      poster_nt VARCHAR(255),
      backdrop VARCHAR(255),
      landscape VARCHAR(255),
      logo VARCHAR(255),
      
      FOREIGN KEY (collection_id) REFERENCES collections(collection_id)
    );

    CREATE TABLE episodes (
      title_id VARCHAR(255) NOT NULL,
      episode_id INTEGER NOT NULL PRIMARY KEY,
      
      path VARCHAR(255) NOT NULL,
      season_num INTEGER NOT NULL,
      episode_num INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      overview VARCHAR(500),
      vote INT,
      duration INTEGER NOT NULL,
      date DATE,

      still VARCHAR(255),
      
      FOREIGN KEY (title_id) REFERENCES titles(title_id)
    );

    CREATE TABLE genres (
      title_id VARCHAR(255) NOT NULL,
      genre VARCHAR(255) NOT NULL,
      UNIQUE(title_id, genre),
      FOREIGN KEY (title_id) REFERENCES titles(title_id) 
    );

    CREATE TABLE people (
      person_id INTEGER NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      birth_date DATE,
      death_date DATE,
      bio VARCHAR(500),
      image VARCHAR(255)
    );

    CREATE TABLE cast (
      person_id INTEGER NOT NULL,
      title_id VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      cast_order INTEGER NOT NULL,
      PRIMARY KEY (title_id, cast_order),
      FOREIGN KEY (person_id) REFERENCES people(person_id),
      FOREIGN KEY (title_id) REFERENCES titles(title_id)
    );

    CREATE TABLE directors (
      person_id INTEGER NOT NULL,
      title_id NOT NULL,
      PRIMARY KEY (person_id, title_id),
      FOREIGN KEY (person_id) REFERENCES people(person_id),
      FOREIGN KEY (title_id) REFERENCES titles(title_id)
    );

    CREATE TABLE users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name VARCHAR(255) NOT NULL, 
      image VARCHAR(255) NOT NULL
    );

    CREATE TABLE continue (
      user_id INTEGER NOT NULL,
      title_id VARCHAR(255) NOT NULL,
      episode_id INT,
      remaining INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, title_id, episode_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    CREATE TABLE watchlist (
      user_id INTEGER NOT NULL,
      title_id VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (title_id) REFERENCES titles(title_id)
    );

    CREATE TABLE subtitles (
      path VARCHAR(255) NOT NULL PRIMARY KEY,
      title_id VARCHAR(255) NOT NULL,
      episode_id INTEGER NOT NULL,
      lang VARCHAR(255) NOT NULL,
      ext VARCHAR(255) NOT NULL,
      UNIQUE(title_id, episode_id, lang, ext),
      FOREIGN KEY (title_id) REFERENCES titles(title_id),
      FOREIGN KEY (episode_id) REFERENCES episodes(episode_id)
    );

    CREATE TABLE torrents (
      uri VARCHAR(255) NOT NULL PRIMARY KEY
    );
    `
  );
}
