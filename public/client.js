//intializes client side socket that communicates with server socket via shared socket id
const socket = io();
let currentRoom = null; // which room this player is in

//we call this function in html, and this function calls socket in server.js
function joinRoom() {
  const room = document.getElementById("roomInput").value.trim();
  if (!room) {
    alert("Enter a room code first");
    return;
  }

  // tell server we want to join
  socket.emit("join-room", room);

  //locally remember the room
  currentRoom = room;

  // switch UI: hide lobby, show room
  document.getElementById("lobbyView").style.display = "none";
  document.getElementById("roomView").style.display = "block";
  document.getElementById("roomName").textContent = room;

  appendLog("You joined room: " + room);
}

function sendMsg() {
  const message = document.getElementById("msgInput").value.trim();

  if (!currentRoom) {
    alert("Join a room first");
    return;
  }
  if (!message) return;

  socket.emit("msg", { room: currentRoom, message: message });
  document.getElementById("msgInput").value = "";
}

socket.on("system-msg", function(text) {
  appendLog("[SYSTEM] " + text);
});

socket.on("msg", function(data) {
  appendLog("[" + data.player + "] " + data.message);
});

function appendLog(text) {
  const log = document.getElementById("log");
  log.textContent += text + "\n";
  log.scrollTop = log.scrollHeight;
}

