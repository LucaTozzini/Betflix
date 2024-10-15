import express from "express";
import expressWs from "express-ws";
import { status_socket } from "../helpers/web_sockets.helpers.js";
import db_manager, { STATUS } from "../helpers/db_manager.helper.js";
const router = express.Router();
let socketId = 0
expressWs(router);

router.get("/task/status", (req, res) => {
  res.json(STATUS);
});

router.ws("/task/status", (ws) => {
  status_socket.subSocket(socketId, ws);
  ws.send(JSON.stringify(STATUS));
  ws.on("close", () => status_socket.unsubSocket(socketId, ws));
  socketId++
});

router.post("/task/:task_number", async (req, res) => {
  const success = await db_manager(parseInt(req.params.task_number));
  res.json({ success });
});

export default router;

status_socket.subSocket(1, 20)
status_socket.subSocket(2, 30)
status_socket.subSocket(3, 40)
status_socket.subSocket(4, 50)
status_socket.notify("")
