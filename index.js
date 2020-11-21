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

  socket.on("join_room", ({ username , room }) => {
    socket.join(room);
    //Welcome user on connection.
    socket.emit("message", {
      sender: "server",
      message: "Welcome to your OCA session.",
    });

    //Broadcast when an user connects.
    socket.broadcast.to(room).emit("message", {
      sender: "server",
      message: `${username} has joined the chat.`,
    });

    
  });

  //Listen for a chatMessage
  socket.on("chatMessage", ({ sender, message, room }) => {
    console.log(`Handled Message ${room}, ${sender}`);
    io.to(room).emit("message", {
      sender,
      message,
    });
  });

  //Listen for teacher feedback
  socket.on("teacher_feedback", (msg) => {
    console.log(msg);
  });

  //Let users know when someone leaves the chat.
  socket.on("disconnect", () => {
    console.log("User disconnection");
  });
});
