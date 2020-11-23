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

io.on("connection", (socket) => {
  console.log("new connection");
  //Broadcast when an user connects.
  socket.broadcast.emit("message", {
    sender: "server",
    message: "A user has joined the chat.",
  });

  //Welcome user on connection.
  socket.emit("message", {
    sender: "server",
    message: "Welcome to your OCA session.",
  });

  //Listen for a chatMessage
  socket.on("chatMessage", ({ sender, message }) => {
    io.emit("message", {
      sender,
      message,
    });
  });

  socket.on("reactionMessage", ({ sender, message }) => {
    // io.emit("message", {
    // sender,
    // message,
    // });
    console.log("Reaction Recieved:" + message);
  });
  socket.on("teacher_feedback", (msg) => {
    console.log(msg);
  });

  //Let users know when someone leaves the chat.
  socket.on("disconnect", () => {
    console.log("User disconnection");
    io.emit("message", {
      sender: "server",
      message: "A user has left the chat",
    });
  });
});
