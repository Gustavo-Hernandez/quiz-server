const express = require("express");
const { router, getSession, getUser, endSession } = require("./sessions");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

const SERVERPORT = process.env.PORT || 8080;

app.use(cors());
app.use(morgan("short"));
app.use(express.json());
app.use(router);

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

  socket.on("join_room", ({ username, room }) => {
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
    io.to(room).emit("message", {
      sender,
      message,
    });
  });

  socket.on("reactionMessage", ({ message, room }) => {
    console.log("Reaction Recieved:" + message);
    io.to(room).emit("reactionMessage", message);
  });

  //Listen for teacher feedback
  socket.on("teacher_feedback", ({ message, room }) => {
    io.to(room).emit("feedback", message);
  });

  //Listen for teacher feedback
  socket.on("start_quiz", ({ room }) => {
    let session = getSession(room);
    const offset = session.currentIndex - (session.questions.length - 1);
    session.started = true;
    io.to(room).emit("quiz_start", true);
    io.to(room).emit("question", {
      offset: offset,
      question: session.questions[session.currentIndex],
    });
  });

  socket.on("next_question", ({ room }) => {
    let session = getSession(room);
    if (session.currentIndex + 1 < session.questions.length) {
      const offset = session.currentIndex + 1 - (session.questions.length - 1);
      session.currentIndex++;
      io.to(room).emit("question", {
        offset,
        question: session.questions[session.currentIndex],
      });
    }
  });

  socket.on("answer", ({ room, correct, uid }) => {
    let user = getUser(room, uid);
    let session = getSession(room);
    if (user.answers[session.currentIndex] === null) {
      user.answers[session.currentIndex] = correct;
      if (correct) {
        user.score++;
      }
    }
  });

  socket.on("end_quiz", ({ room }) => {
    let session = getSession(room);
    let participants = session.participants;
    session.quizEnded = true;
    participants.shift();
    io.to(room).emit("quiz_start", false);
    io.to(room).emit("results", participants);
  });

  socket.on("end_session", ({ room }) => {
    io.to(room).emit("end_session");
    endSession(room);
  });

  socket.on("relog", ({ room, uid }) => {
    let user = getUser(room, uid);
    let session = getSession(room);
    let offset = session.currentIndex - (session.questions.length - 1);
    let participants = Array.from(session.participants);

    if (session.quizEnded) {
      io.to(room).emit("quiz_start", false);
      return io.to(room).emit("results", participants);
    } else {
      if (session.started) {
        io.to(room).emit("quiz_start", true);
        io.to(room).emit("question", {
          offset,
          question: session.questions[session.currentIndex],
        });
      }
    }
  });

  //Let users know when someone leaves the chat.
  socket.on("disconnect", () => {
    console.log("User disconnection");
  });
});
