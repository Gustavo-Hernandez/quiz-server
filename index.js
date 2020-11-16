const express = require("express");
const sessions = require("./sessions");
const app = express();

const SERVERPORT = process.env.PORT || 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(sessions);


app.listen(SERVERPORT, ()=>{
    console.log("Server is up and running on port " + SERVERPORT);
})