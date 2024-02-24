import cors from "cors";
import express from "express";

import database_routes from "./src/routes/database.routes.js";
import user_routes from "./src/routes/user.routes.js";
import browse_routes from "./src/routes/browse.routes.js";
import watchlist_routes from "./src/routes/watchlist.routes.js";
import player_router from "./src/routes/player.routes.js";
import search_router from "./src/routes/search.routes.js";
import subtitles_router from "./src/routes/subtitles.routes.js";
import torrents_router from "./src/routes/torrents.routes.js";

const PORT = 2000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/browse", browse_routes);
app.use("/player", player_router);
app.use("/search", search_router);
app.use("/database", database_routes);
app.use("/subtitles", subtitles_router);
app.use("/torrents", torrents_router);

app.use("/user", user_routes);
app.use("/user/watchlist", watchlist_routes);

//
app.get("/ciao", (req, res) => res.send("yellow"));

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
