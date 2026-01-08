//render uses express to send frontend data to client
//render uses socket to communicate real time data between client and its server
//render sends/retrives data from mongodb using mongoose

//imports dotenv and calls config method
//sends data to proccess.env object
require("dotenv").config();

//import express object
const express = require("express");
//import http object which lets use make the http server render hosts
const http = require("http");
//import back end object from socket.io
const { Server } = require("socket.io");
//import mongoose
const mongoose = require("mongoose");

//constructs app as express object
const app = express();
app.get("/ping", (req, res) => res.send("ok"));
//http server object to be hosted on render
const server = http.createServer(app);
//constructs io as socket server object
const io = new Server(server);

const countriesKey = [
"Afghanistan",
"Albania",
"Algeria",
"Andorra",
"Angola",
"Antarctica",
"Antigua and Barbuda",
"Argentina",
"Armenia",
"Australia",
"Austria",
"Azerbaijan",
"The Bahamas",
"Bahrain",
"Bangladesh",
"Barbados",
"Belarus",
"Belgium",
"Belize",
"Benin",
"Bhutan",
"Bolivia",
"Bosnia and Herzegovina",
"Botswana",
"Brazil",
"Brunei",
"Bulgaria",
"Burkina Faso",
"Burundi",
"Cambodia",
"Cameroon",
"Canada",
"Cape Verde",
"The Central African Republic",
"Chad",
"Chile",
"China",
"Colombia",
"Comoros",
"Costa Rica",
"Côte d'Ivoire",
"Croatia",
"Cuba",
"Cyprus",
"The Czech Republic",
"The Democratic Republic of the Congo",
"Denmark",
"Djibouti",
"Dominica",
"Dominican Republic",
"Ecuador",
"Egypt",
"El Salvador",
"Equatorial Guinea",
"Eritrea",
"Estonia",
"Eswatini",
"Ethiopia",
"Fiji",
"Finland",
"France",
"French Guiana",
"Gabon",
"The Gambia",
"Georgia",
"Germany",
"Ghana",
"Greece",
"Greenland",
"Grenada",
"Guatemala",
"Guinea",
"Guinea-Bissau",
"Guyana",
"Haiti",
"Honduras",
"Hungary",
"Iceland",
"India",
"Indonesia",
"Iran",
"Iraq",
"Ireland",
"Israel",
"Italy",
"Jamaica",
"Japan",
"Jordan",
"Kazakhstan",
"Kenya",
"Kiribati",
"Kosovo",
"Kuwait",
"Kyrgyzstan",
"Laos",
"Latvia",
"Lebanon",
"Lesotho",
"Liberia",
"Libya",
"Liechtenstein",
"Lithuania",
"Luxembourg",
"Madagascar",
"Malawi",
"Malaysia",
"The Maldives",
"Mali",
"Malta",
"The Marshall Islands",
"Mauritania",
"Mauritius",
"Mexico",
"Micronesia",
"Moldova",
"Monaco",
"Mongolia",
"Montenegro",
"Morocco",
"Mozambique",
"Myanmar",
"Namibia",
"Nauru",
"Nepal",
"The Netherlands",
"New Zealand",
"Nicaragua",
"Niger",
"Nigeria",
"North Korea",
"North Macedonia",
"Norway",
"Oman",
"Pakistan",
"Palau",
"Palestine",
"Panama",
"Papua New Guinea",
"Paraguay",
"Peru",
"The Philippines",
"Poland",
"Portugal",
"Puerto Rico",
"Qatar",
"The Republic of the Congo",
"Romania",
"Russia",
"Rwanda",
"Saint Kitts and Nevis",
"Saint Lucia",
"Saint Vincent and the Grenadines",
"Samoa",
"San Marino",
"Sao Tome and Principe",
"Saudi Arabia",
"Senegal",
"Serbia",
"Seychelles",
"Sierra Leone",
"Singapore",
"Slovakia",
"Slovenia",
"The Solomon Islands",
"Somalia",
"South Africa",
"South Korea",
"South Sudan",
"Spain",
"Sri Lanka",
"Sudan",
"Suriname",
"Sweden",
"Switzerland",
"Syria",
"Taiwan",
"Tajikistan",
"Tanzania",
"Thailand",
"Timor-Leste",
"Togo",
"Tonga",
"Trinidad and Tobago",
"Tunisia",
"Turkey",
"Turkmenistan",
"Tuvalu",
"Uganda",
"Ukraine",
"The United Arab Emirates",
"The United Kingdom",
"The United States",
"Uruguay",
"Uzbekistan",
"Vanuatu",
"Vatican City",
"Venezuela",
"Vietnam",
"Yemen",
"Western-Sahara",
"Zambia",
"Zimbabwe"
  ];

class Room{

  constructor(roomcode, host, hostUsername){
    this.players = new Map();
    this.players.set(host, {username: hostUsername, points: 0})
    this.roomcode = roomcode;
    this.host = host;
    this.countries = new Map();
    for (const country of countriesKey) {
      this.countries.set(country, true);
    }
  }

}

const map = new Map();
//key is roomcode
//value is room


function removePlayer(id){
  for (const [roomcode, room] of map.entries()) {
    if(room.players.has(id)){
      io.to(roomcode).emit("system-msg",`${room.players.get(id).username} left the room!`);
      room.players.delete(id);
    }

    if (room.players.size === 0) {
      map.delete(roomcode);
      continue;
    }

    if (room.host === id) {
      room.host = room.players.keys().next().value;
      io.to(room.host).emit("new-host");
      io.to(roomcode).emit("system-msg", `${room.players.get(room.host).username} is the new host!`)
    }
  }
}

function updateLeaderboard(roomcode) {
  const room = getRoom(roomcode);
  
  const sortedLeaderboard = [...room.players.entries()].sort(
    ([, a], [, b]) => b.points - a.points
  );

  io.to(roomcode).emit("update-leaderboard", sortedLeaderboard);
}



function isRoom(roomcode){
  return map.has(roomcode);
}

function getRoom(roomcode){
  return map.get(roomcode);
}


function getRandomCountry(room){
  let unusedCountries = [];
  for(const [country, state] of room.countries.entries()){
    if(state){
      unusedCountries.push(country);
    }
  }

  if(unusedCountries.length === 0){
    let maxPoints = 0;
    let winner = null;
    for(const player of room.players.values()){
      if(player.points > maxPoints){
        maxPoints = player.points;
        winner = player.username;
      }
    }
    for (const country of room.countries.keys()) {
      room.countries.set(country, true);
    }
    for (const player of room.players.values()){
      player.points = 0;
    }
    io.to(room.host).emit("game-end");
    io.to(room.roomcode).emit("system-msg", `${winner} wins!\nWaiting for host to play again...`)
    return;
  }

  let x = Math.floor(Math.random()*unusedCountries.length);
  let pick = unusedCountries[x];
  room.countries.set(pick, false);
  return pick;
}


//---------Mongoose Connection---------

//gets the url of my mongodb
//finds url data in env object which is in proccess object
const MONGO_URI = process.env.MONGODB_URI || "";

//if we get the url
if (MONGO_URI) {
    //connect to mongoose, then log appropriate status update upon successful/failed connection
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB error:", err));
} else {
  console.log("No MONGODB_URI set. Running without database for now.");
}

//---------Front End stuff---------
//tells the express which files to use from public folder
app.use(express.static("public"));

//---------Socket.io---------

//on is a method that checks for events
//if the socket object (io) detects connection creates anon function
//like if statements in threads
//everything is done async, non blocking

//continously scans for connection, if connection passes new func containing socket functions
io.on("connection", function(socket) {
  console.log("Player connected:", socket.id);
  
  //if connection made, begin scanning for socket events

  socket.on("request-country", function(roomcode){
    const country = getRandomCountry(getRoom(roomcode));
    if(country){
      io.to(roomcode).emit("new-country", country);
    }
  });
  
  socket.on("roomcode-validation", function(attemptRoomcode, callback){
    callback(isRoom(attemptRoomcode));
  });


  socket.on("create-room", function(roomcode, username){
    const room = new Room(roomcode, socket.id, username);

    map.set(roomcode, room);
    socket.join(roomcode);
    console.log(`Player ${socket.id} joined room ${roomcode}`);
  });

  //if user tries to join room, then let them into room and send messages
  socket.on("join-room", function(roomcode, username) {
    roomcode = (roomcode || "").trim();
    if (!roomcode) return;
    socket.join(roomcode);
    getRoom(roomcode).players.set(socket.id, {username: username, points: 0});
    console.log(`Player ${socket.id} joined room ${roomcode}`);
    io.to(roomcode).emit(
      "system-msg",
      `${username} joined the room!`
    );
  });

  socket.on("update-scores", function(roomcode, points){
    getRoom(roomcode).players.get(socket.id).points += points;
    updateLeaderboard(roomcode);
  });

  //if user sends message, send message to room
  socket.on("msg", function(data) {
    const room = (data.room || "").trim();
    const message = (data.message || "").trim();
    if (!room || !message) return;
    io.to(room).emit("msg", {
      player: data.username,
      message
    });
  });
  
  //if user disconnections, log that
  socket.on("disconnect", function() {
    console.log("Player disconnected:", socket.id);
    removePlayer(socket.id);

});
});


//---------Start Server---------

//get port from process.env
const PORT = process.env.PORT || 3000;
//start recieving data from that port to our server
server.listen(PORT, function() {
  console.log(`🚀 Server running on port ${PORT}`);
});
