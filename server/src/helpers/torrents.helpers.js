import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import webtorrent from "webtorrent";
import { moveFile } from "move-file";
import { query_torrents } from "./db_queries.helper.js";
import { insert_torrent } from "./db_inserts.helper.js";
import { delete_torrent } from "./db_deletes.helper.js";
import { validExt, validSubExt } from "./files_util.helpers.js";
dotenv.config();

const handleDone = async (torrent) => {
  try {
    const t_root = process.env.TORR_ACTIVE_PATH;
    const m_root = process.env.MOVIES_PATH;
    if (!fs.existsSync(m_root)) throw new Error("Movies Folder Unavailable");
    for (const { path: rel } of torrent.files) {
      console.log("on:",rel);
      if (!validExt(rel) && !validSubExt(rel)) continue; // skip unwanted files
      const cur = path.join(t_root, rel); // current path of file
      const tar = path.join(m_root, rel); // want to move here
      await moveFile(cur, tar);
    }
    await rem_magnet(torrent);
  } catch (err) {
    console.error(err);
  }
};

const destroy_torrent = (torrent) =>
  new Promise((res, rej) => torrent.destroy((err) => (err ? rej(err) : res())));

const client = new webtorrent();
client.on("error", (err) => console.error(err.message));
client.on("torrent", (torrent) => {
  insert_torrent(torrent.magnetURI);
  torrent.on("done", () => handleDone(torrent));
  torrent.on("error", (err) => console.error(err.message));
});

export const add_magnet = async (torrentURL) => {
  try {
    const root = process.env.TORR_ACTIVE_PATH;
    if (!fs.existsSync(root)) throw new Error("TORR_ACTIVE_PATH unavailable");
    client.add(torrentURL, { path: root });
  } catch (err) {
    console.error(err.message);
  }
};

export const rem_magnet = async (torrent) => {
  try {
    await destroy_torrent(torrent);
    await delete_torrent(torrent.magnetURI);
  } catch (err) {
    console.log(err);
  }
};

export const active_torrents = () =>
  client.torrents.map(
    ({ downloaded, downloadSpeed, numPeers, name, paused, progress, magnetURI, timeRemaining }) => ({
      downloaded,
      downloadSpeed,
      numPeers,
      name,
      paused,
      progress,
      magnetURI,
      timeRemaining,
    })
  );

export const from_db = async () => {
  const torrents = await query_torrents();
  for (const torrent of torrents) {
    await add_magnet(torrent.uri);
  }
};
