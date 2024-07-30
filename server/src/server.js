import cors from "cors";
import bonjour from "bonjour";
import express from "express";
import expressWs from "express-ws";

import users_router from "./routes/users.routes.js";
import titles_router from "./routes/titles.routes.js";
import people_router from "./routes/people.routes.js";
import player_router from "./routes/player.routes.js";
import continue_router from "./routes/continue.routes.js";
import database_router from "./routes/database.routes.js";
import torrents_router from "./routes/torrents.routes.js";
import subtitles_router from "./routes/subtitles.routes.js";
import watchlist_router from "./routes/watchlist.routes.js";

const PORT = 4040;
const app = express();
expressWs(app);

function handleError(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something whent wrong with", req.path);
}

function handleListen(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("listening on port", PORT);
}

function handleCiao(req, res) {
  res.send("yellow");
}

app.use(cors());
app.use(handleError);
app.use(express.json());

app.use("/users", users_router);
app.use("/titles", titles_router);
app.use("/people", people_router);
app.use("/player", player_router);
app.use("/continue", continue_router);
app.use("/torrents", torrents_router);
app.use("/database", database_router);
app.use("/subtitles", subtitles_router);
app.use("/watchlist", watchlist_router);

app.get("/ciao", handleCiao);

app.listen(PORT, "0.0.0.0", handleListen);

const service = bonjour().publish({
  name: "Betflix Server",
  port: PORT,
  type: "http",
  protocol: "tcp",
});

service.on("up", () => console.log("Service is up"));
service.on("error", (err) => console.error("Service error", err.message));