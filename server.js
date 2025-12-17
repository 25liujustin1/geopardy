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

  //if user tries to join room, then let them into room and send messages
  socket.on("join-room", function(room) {
    room = (room || "").trim();
    if (!room) return;
    socket.join(room);
    console.log(`Player ${socket.id} joined room ${room}`);
    io.to(room).emit(
      "system-msg",
      `Player ${socket.id} joined room ${room}`
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
