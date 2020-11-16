const express = require("express");
const { readSync } = require("fs");
const router = express.Router();
const io = require("socket.io");

const activeSessions = [];
router.get("/api/sessions", (req, res) => {
  return res.status(200).json({ success: true, sessions: activeSessions });
});

router.post("/api/create-session", (req, res) => {
  let newSession = {
    pin: generatePin(),
    started: false,
    participants: [],
    ...req.body,
  };
  activeSessions.push(newSession);
  console.log(activeSessions);
  return res
    .status(200)
    .json({
      success: true,
      message: "Session created successfully",
      session: newSession,
    });
});

router.post("/api/close-session", (req, res) => {
  const index = findSessionIndex(req.body.pin);
  if (index >= 0) {
    activeSessions.splice(index, 1);
    return res
      .status(200)
      .json({ success: true, message: "Session closed successfully" });
  }
  return res
    .status(422)
    .json({ success: false, message: "Unexistent session" });
});

router.post("/api/join-session", (req, res) => {
  const { pin, username } = req.body;
  const index = findSessionIndex(pin);
  if (username && username.length > 0 ) {
    if (index >= 0) {
        activeSessions[index].participants.push({ username });
        return res
          .status(200)
          .json({ success: true, message: "Joined successfully" });
      }
      return res
        .status(422)
        .json({ success: false, message: "Unexistent session" });
  }else{
    return res
        .status(422)
        .json({ success: false, message: "You must provide an username" });
  }
});

function generatePin() {
  const pinLength = 6;
  const possibleValues = "0123456789";
  let pin = "";
  for (let i = 0; i <= pinLength; i++) {
    let randomIndex = Math.round(Math.random() * possibleValues.length - 1);
    pin += possibleValues.charAt(randomIndex);
  }
  if (!pinIsUnique(pin)) {
    return generatePin();
  }
  return pin;
}

function pinIsUnique(pin) {
  for (let i = 0; i < activeSessions.length; i++) {
    if (activeSessions[i].pin === pin) {
      return false;
    }
  }
  return true;
}

function findSessionIndex(pin) {
  for (let i = 0; i < activeSessions.length; i++) {
    if (activeSessions[i].pin === pin) {
      return i;
    }
  }
  return -1;
}

module.exports = router;
