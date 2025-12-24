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
//http server object to be hosted on render
const server = http.createServer(app);
//constructs io as socket server object
const io = new Server(server);

class Room{

  constructor(roomcode, host){
    this.roomcode = roomcode;
    this.host = host;
  }
  /*
  countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
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
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
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
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
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
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
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
  "Netherlands",
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
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Republic of the Congo",
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
  "Solomon Islands",
  "Somalia",
  "South Africa",
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
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
  ];
  */
  countries = ["Libya", "Tunisia", "Egypt", "Afghanistan","Albania","Algeria","Andorra","Israel","Palestine"];

  players = [];

}

let rooms = [];

let roomcodes = [];

function isRoom(input){
  for(const roomCode of roomcodes){
    if(input == roomCode){
      return true;
    }
  }
  return false;
}

function getRoom(Roomcode){
  for(const room of rooms){
    if(room.roomcode === Roomcode){
      return room;
    }
  }
}


function getRandomCountry(room){
  let x = Math.floor(Math.random()*room.countries.length);
  let temp = room.countries[x];
  room.countries.splice(x, 1);
  return temp;
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
  
  //if connection made, begin scanning for socket events4

  socket.on("request-country", function(roomcode){
    country = getRandomCountry(getRoom(roomcode));
    io.to(roomcode).emit("new-country", country);
  });
  
  socket.on("roomcode-validation", function(attemptRoomcode, callback){
    callback(isRoom(attemptRoomcode));
  });

  socket.on("update-roomcodes", function(roomcode){
    roomcodes.push(roomcode);
  });

  socket.on("create-room", function(roomcode){
    const room = new Room(roomcode, socket.id);
    rooms.push(room);
    roomcodes.push(roomcode);
    socket.join(roomcode);
    console.log(`Player ${socket.id} joined room ${roomcode}`);
    io.to(roomcode).emit(
      "system-msg",
      `Player ${socket.id} joined room ${roomcode}`
    );
  });

  //if user tries to join room, then let them into room and send messages
  socket.on("join-room", function(roomcode) {
    roomcode = (roomcode || "").trim();
    if (!roomcode) return;
    socket.join(roomcode);
    getRoom(roomcode).players.push(socket.id);
    console.log(`Player ${socket.id} joined room ${roomcode}`);
    io.to(roomcode).emit(
      "system-msg",
      `Player ${socket.id} joined room ${roomcode}`
    );
  });
  
  //if user sends message, send message to room
  socket.on("msg", function(data) {
    const room = (data.room || "").trim();
    const message = (data.message || "").trim();
    if (!room || !message) return;
    io.to(room).emit("msg", {
      player: socket.id,
      message
    });
  });
  
  //if user disconnections, log that
  socket.on("disconnect", function() {
    console.log("Player disconnected:", socket.id);
  });


});


//---------Start Server---------

//get port from process.env
const PORT = process.env.PORT || 3000;
//start recieving data from that port to our server
server.listen(PORT, function() {
  console.log(`🚀 Server running on port ${PORT}`);
});
