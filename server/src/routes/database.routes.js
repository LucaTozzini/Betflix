import express from "express";
import expressWs from "express-ws";
import { status_socket } from "../helpers/web_sockets.helpers.js";
import db_manager, { STATUS } from "../helpers/db_manager.helper.js";
const router = express.Router();
expressWs(router);

router.get("/task/status", (req, res) => {
  res.json(STATUS);
});

router.ws("/task/status", (ws, req) => {
  status_socket.sub(ws);
  ws.send(JSON.stringify(STATUS));
  ws.on("close", () => status_socket.unsub(ws));
});

router.post("/task/:task_number", async (req, res) => {
  const success = await db_manager(parseInt(req.params.task_number));
  res.json({ success });
});

export default router;
