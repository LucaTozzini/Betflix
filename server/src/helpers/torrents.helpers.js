import fs from "fs";
import path from "path";
import { moveFile } from "move-file";
import webtorrent from "webtorrent";
import env from "../../env.js";
const { torrents_downloading_path } = env;
import { validExt, validSubExt } from "./filesUtil.helpers.js";
import { publicManager } from "./database.helpers.js";
import { getTorrents, addTorrent, remTorrent } from "./database.helpers.js";

// Helpers
const client = new webtorrent();

client.on("torrent", (torrent) => {
  addTorrent(torrent.magnetURI).catch(() => {});
  torrent.on("done", async () => {
    for (const file of torrent.files) {
      const thisPath = path.join(env.torrents_downloading_path, file.path);
      if (validExt(file.path) || validSubExt(file.path)) {
        const targetPath = path.join(env.moviesPath, file.path);
        await moveFile(thisPath, targetPath);
      }
      await new Promise((res) => fs.unlink(thisPath, res));
    }
    remMagnet(torrent.magnetURI);
    try {
      if (!publicManager.status.ACTIVE) {
        await publicManager.run(1);
        await publicManager.run(2);
      }
    } catch (err) {
      console.error(err.message);
    }
  });
  torrent.on("error", (err) => {
    console.error("torrent error:", err.message);
    remTorrent(torrent.magnetURI).catch((err) => console.error(err.message));
  });
});

client.on("error", (err) => {
  console.error(err.message);
});

// Exports
const addMagnet = async (magnetURI) => {
  try {
    console.log(fs.existsSync(torrents_downloading_path))
    if (!fs.existsSync(torrents_downloading_path)) {
      throw new Error(
        "addMagnet Error: torrents_downloading_path does not exist"
      );
    }
    if (!(await client.get(magnetURI))) {
      client.add(magnetURI, { path: torrents_downloading_path });
    } else {
    }
  } catch (err) {
    console.error(err.message);
  }
};

const remMagnet = (magnetURI) =>
  new Promise(async (res, rej) => {
    try {
      const torrent = await client.get(magnetURI);
      await new Promise((res, rej) => torrent.destroy(res));
      await remTorrent(magnetURI);
      res();
    } catch (err) {
      rej(err);
    }
  });

const activeTorrents = () => {
  const data = [];
  for (const {
    name,
    progress,
    timeRemaining,
    magnetURI,
    paused,
  } of client.torrents) {
    data.push({ name, progress, timeRemaining, magnetURI, paused });
  }
  return data;
};

const addFromDB = async () => {
  const torrents = await getTorrents();
  for (const torrent of torrents) {
    addMagnet(torrent.uri);
  }
};

export { addMagnet, remMagnet, activeTorrents, addFromDB };
