//intializes client side socket that communicates with server socket via shared socket id
const socket = io();
let currentRoomcode = null; // which room this player is in
let username = null;
let host = false;
let currentCountry = null;
/*const countries = [
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
const countryIds = ["libya", "tunisia", "egypt","israel","palestine", "france","afghanistan",
  "albania",
  "algeria",
  "andorra",
  "angola",
  "antigua-and-barbuda",
  "argentina",
  "armenia",
  "australia",
  "austria",
  "azerbaijan"];
//we call this function in html, and this function calls socket in server.js

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function intializeCountryEventListeners(){
  for(const countryId of countryIds){
    document.getElementById(countryId).addEventListener("click", function(){
      if(toId(currentCountry) === countryId){
        document.getElementById(countryId).style.fill = "#006B0D";
        getNewCountry(currentRoomcode);
      }else if(currentCountry && window.getComputedStyle(document.getElementById(countryId)).fill !== "rgb(0, 107, 13)"){
        if(document.getElementById(countryId).classList.contains("region")){
          document.getElementById(countryId).style.fill = "rgba(255, 0, 0, 0.5)";
        }else{
          document.getElementById(countryId).style.fill = "rgba(227, 117, 86, 1)";
        }
        setTimeout(function () {
        document.getElementById(countryId).style.removeProperty("fill");
      }, 750);
      }
    });
  }
}



function randomChars(){
  let x = Math.floor(Math.random()*58) + 75;
  if(x > 122){
    return x - 123;
  }else{
    return String.fromCharCode(x);
  }
}

function roomCodeGenerator(){
  let x = "";
  for (let i = 0; i < 6; i++){
    x += randomChars();
  }
  return x;
}

function createRoom(){
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("roomsPopup").style.display = "none";
  document.getElementById("startGameButton").style.display = "block";
  roomcode = roomCodeGenerator();
  currentRoomcode = roomcode;
  socket.emit("create-room", roomcode, username);
  socket.emit("update-roomcodes", roomcode);
  host = true;
  joinRoom(false);
} 

function joinRoomPrep(){
  document.getElementById("mainPage").style.display = "none";
  document.getElementById("roomsPopup").style.display = "none";
  document.getElementById("joinRoomDisplay").style.display = "block";
}

function roomsPopup(){
  username = document.getElementById("usernameInput").value.trim();
  if(!username){
    alert("Please enter an username");
    return;
  }
  document.getElementById("roomsPopup").style.display = "block";
}

function attemptJoinRoom(attemptRoomcode){
  socket.emit("roomcode-validation", attemptRoomcode, function(bool){
    if(bool){
      joinRoom(attemptRoomcode);
    }else{
      alert("Invalid roomcode");
    }
  })
}

function getNewCountry(){
  socket.emit("request-country", currentRoomcode);
}

socket.on("new-country", function(country){
  if(currentCountry){
    document.getElementById(toId(currentCountry)).style.fill = "#006B0D";
  }
  currentCountry = country;
  document.getElementById("country").textContent = currentCountry;
});


function joinRoom(roomcode) {

  // tell server we want to join
  if(roomcode){
    socket.emit("join-room", roomcode, username);
    currentRoomcode = roomcode;
  }

  // switch UI: hide lobby, show room
  document.getElementById("joinRoomDisplay").style.display = "none";
  document.getElementById("roomView").style.display = "block";
  document.getElementById("map").style.display = "block";
  document.getElementById("roomName").textContent = currentRoomcode;

  appendLog("You joined room: " + currentRoomcode);

  intializeCountryEventListeners();
}

function startGame() {
  document.getElementById("startGameButton").style.display = "none";
  getNewCountry();
}

function sendMsg() {
  const message = document.getElementById("msgInput").value.trim();

  if (!currentRoomcode) {
    alert("Join a room first");
    return;
  }
  if (!message) return;

  socket.emit("msg", { room: currentRoomcode, message: message, username: username});
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

