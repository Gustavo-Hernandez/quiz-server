const express = require("express");
const router = express.Router();

const activeSessions = [];
router.get("/api/sessions", (req, res) => {
  return res.json({ success: true, sessions: activeSessions });
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
  return res.json({
    success: true,
    message: "Session created successfully",
    session: newSession,
  });
});

router.post("/api/close-session", (req, res) => {
  const index = findSessionIndex(req.body.pin);
  if (index >= 0) {
    activeSessions.splice(index, 1);
    return res.json({ success: true, message: "Session closed successfully" });
  }
  return res.json({ success: false, message: "Unexistent session" });
});

router.post("/api/join-session", (req, res) => {
  const { pin, username } = req.body;
  const index = findSessionIndex(pin);
 
  if (username && username.length > 0) {
    if (index >= 0) {
      let tempId = username + Date.now();
      activeSessions[index].participants.push({
        username,
        score: 0,
        localId: tempId
      });
      return res.json({
        success: true,
        message: "Joined successfully",
        questions: activeSessions[index].questions,
        title: activeSessions[index].classname,
        user: {
          username,
          score: 0,
          localId: tempId,  
        },
      });
    }
    return res.json({ success: false, message: "Unexistent session" });
  } else {
    return res.json({
      success: false,
      message: "You must provide an username",
    });
  }
});

function generatePin() {
  const pinLength = 9;
  const possibleValues = "0123456789";
  let pin = "";
  for (var i = 0; i < pinLength; i++) {
    let randomIndex = Math.round(Math.random() * 8);
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

function getSession(pin){
  let index = findSessionIndex(pin);
  return activeSessions[index];
}


module.exports = {router, getSession};
