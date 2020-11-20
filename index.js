const express = require("express");
const sessions = require("./sessions");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const SERVERPORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan("short"));
app.use(express.json());
app.use(sessions);

const server = app.listen(SERVERPORT, () => {
  console.log("Server is up and running on port " + SERVERPORT);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", () => {
  console.log("Connected.");
});
