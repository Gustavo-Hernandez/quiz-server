const io = require("socket.io");

io.on("connection", ()=>{
    console.log("Connected.");
});

module.exports = io;