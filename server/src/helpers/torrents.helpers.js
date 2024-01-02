import fs from "fs";
import webtorrent from "webtorrent";
import env from "../../env.js";
const { torrents_downloading_path } = env;

// Helpers
const client = new webtorrent();
client.on("torrent", (torrent) => {
  torrent.on("done", () => {
    client.remove(torrent.magnetURI);
  });
  torrent.on("error", (err) => {
    console.error(err.message);
		client.remove(torrent.magnetURI);
  });
});

// Exports
const addMagnet = async (magnetURI) => {
  if (!await client.get(magnetURI)) {
    client.add(magnetURI, { path: torrents_downloading_path });
  } else {
    console.log("Duplicate");
  }
};

const activeTorrents = () => {
  const data = [];
  for (const { name, progress, timeRemaining, magnetURI } of client.torrents) {
    data.push({ name, progress, timeRemaining, magnetURI });
  }
  return data;
};

export { addMagnet, activeTorrents };
