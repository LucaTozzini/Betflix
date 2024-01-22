import fs from "fs";
import path from "path";
import { moveFile } from "move-file";
import webtorrent from "webtorrent";
import env from "../../env.js";
const { torrents_downloading_path } = env;
import { validExt, validSubExt } from "./filesUtil.helpers.js";
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

    // not working :(
    //
    // const dir = path.parse(torrent.files[0].path).dir;
    // const folder = path.join(
    //   env.torrents_downloading_path,
    //   dir.split(/\/\\/g)[0]
    // );
    // fs.rmSync(folder, {recursive: true});
    //

    client.remove(torrent.magnetURI);
    remTorrent(torrent.magnetURI).catch((err) => console.error(err.message));
  });
  torrent.on("error", (err) => {
    console.error(err.message);
    client.remove(torrent.magnetURI);
    remTorrent(torrent.magnetURI).catch((err) => console.error(err.message));
  });
});

client.on("error", (err) => {
  console.error(err.message);
});

// Exports
const addMagnet = async (magnetURI) => {
  if (!(await client.get(magnetURI))) {
    client.add(magnetURI, { path: torrents_downloading_path });
  } else {
    console.log("Duplicate");
  }
};

const remMagnet = (magnetURI) => new Promise(async (res, rej) => {
  try {
    await new Promise((res, rej) => client.remove(magnetURI, (err) => err ? rej(err) : res()));
    await remTorrent(magnetURI);
    res();
  } catch(err) {
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
