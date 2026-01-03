//intializes client side socket that communicates with server socket via shared socket id
const socket = io();
let currentRoomcode = null; // which room this player is in
let username = null;
let host = false;
let currentCountry = null;

const countryIds = ["afghanistan",
"albania",
"algeria",
"andorra",
"angola",
"antarctica",
"antigua-and-barbuda",
"argentina",
"armenia",
"australia",
"austria",
"azerbaijan",
"the-bahamas",
"bahrain",
"bangladesh",
"barbados",
"belarus",
"belgium",
"belize",
"benin",
"bhutan",
"bolivia",
"bosnia-and-herzegovina",
"botswana",
"brazil",
"brunei",
"bulgaria",
"burkina-faso",
"burundi",
"cambodia",
"cameroon",
"canada",
"cape-verde",
"the-central-african-republic",
"chad",
"chile",
"china",
"colombia",
"comoros",
"costa-rica",
"cote-d-ivoire",
"croatia",
"cuba",
"cyprus",
"the-czech-republic",
"the-democratic-republic-of-the-congo",
"denmark",
"djibouti",
"dominica",
"dominican-republic",
"ecuador",
"egypt",
"el-salvador",
"equatorial-guinea",
"eritrea",
"estonia",
"eswatini",
"ethiopia",
"fiji",
"finland",
"france",
"french-guiana",
"gabon",
"the-gambia",
"georgia",
"germany",
"ghana",
"greece",
"greenland",
"grenada",
"guatemala",
"guinea",
"guinea-bissau",
"guyana",
"haiti",
"honduras",
"hungary",
"iceland",
"india",
"indonesia",
"iran",
"iraq",
"ireland",
"israel",
"italy",
"jamaica",
"japan",
"jordan",
"kazakhstan",
"kenya",
"kiribati",
"kosovo",
"kuwait",
"kyrgyzstan",
"laos",
"latvia",
"lebanon",
"lesotho",
"liberia",
"libya",
"liechtenstein",
"lithuania",
"luxembourg",
"madagascar",
"malawi",
"malaysia",
"the-maldives",
"mali",
"malta",
"the-marshall-islands",
"mauritania",
"mauritius",
"mexico",
"micronesia",
"moldova",
"monaco",
"mongolia",
"montenegro",
"morocco",
"mozambique",
"myanmar",
"namibia",
"nauru",
"nepal",
"the-netherlands",
"new-zealand",
"nicaragua",
"niger",
"nigeria",
"north-korea",
"north-macedonia",
"norway",
"oman",
"pakistan",
"palau",
"palestine",
"panama",
"papua-new-guinea",
"paraguay",
"peru",
"the-philippines",
"poland",
"portugal",
"puerto-rico",
"qatar",
"the-republic-of-the-congo",
"romania",
"russia",
"rwanda",
"saint-kitts-and-nevis",
"saint-lucia",
"saint-vincent-and-the-grenadines",
"samoa",
"san-marino",
"sao-tome-and-principe",
"saudi-arabia",
"senegal",
"serbia",
"seychelles",
"sierra-leone",
"singapore",
"slovakia",
"slovenia",
"the-solomon-islands",
"somalia",
"south-africa",
"south-korea",
"south-sudan",
"spain",
"sri-lanka",
"sudan",
"suriname",
"sweden",
"switzerland",
"syria",
"taiwan",
"tajikistan",
"tanzania",
"thailand",
"timor-leste",
"togo",
"tonga",
"trinidad-and-tobago",
"tunisia",
"turkey",
"turkmenistan",
"tuvalu",
"uganda",
"ukraine",
"the-united-arab-emirates",
"the-united-kingdom",
"the-united-states",
"uruguay",
"uzbekistan",
"vanuatu",
"vatican-city",
"venezuela",
"vietnam",
"yemen",
"western-sahara",
"zambia",
"zimbabwe"
];
//we call this function in html, and this function calls socket in server.js

function toId(name) {
  return name
    .toLowerCase()
    .normalize("NFD")  // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "")  // Remove accent marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function intializeCountryEventListeners(){
  for(const countryId of countryIds){
    document.getElementById(countryId).addEventListener("click", function(){
      if(toId(currentCountry) === countryId){
        document.getElementById(countryId).style.fill = "#006B0D";
        if(document.getElementById(countryId).classList.contains("circleRegion")){
          document.getElementById(countryId).style.stroke ="none";
        }
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
  document.getElementById("usernameInput").style.display = "none";
  document.querySelector("h1").style.display = "none";
  document.getElementById("gameContainer").style.display = "grid";
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

