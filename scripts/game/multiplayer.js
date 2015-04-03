/*_____________MULTIPLAYER_________*/
function connect(){
	//Server not found
 	if (typeof io == "undefined") return;

	// Initialise socket connection
	socket = io.connect("http://"+host+":"+port);

	// Initialise remote players array
	remotePlayers = [];


//Events Definitions_________

 //socket.io default events_

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

 //custom events_

	// New player
	socket.on("NWP", onNewPlayer);

	// Player move
	socket.on("MVP", onMovePlayer);

	// Player Fire
	socket.on("BLP", onFireBullet);

	// Player been Hit
	socket.on("HTP", onPlayerHit);
	
	// Player Dead
	socket.on("DEP", onPlayerDead);

	// Player removed (disconnected)
	socket.on("RMP", onRemovePlayer);	

	// general message received, mostly chatlog
	socket.on("MSG", onMSG);

	// Player killed other player ,add stats
	socket.on("KLL", onPlayerKill);

	// Get Players stats
	socket.on("PST", onPlayerStats);
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	addLog("Connected to "+host+":"+port+" server");
	
	// Send local player data to the game server
    var playerName = "Guest"+rand(1000,2000),	
    	bounds = 100,
    	startX = rand(bounds,canvasWidth-bounds),
		startY = rand(bounds,canvasHeight-bounds),
		startAngle = 0;
  
    var playerNameInput = prompt("Please enter your name", playerName);
    if (playerNameInput != null) {
       playerName = playerNameInput;
    }

    playerObj = new Player(playerName,startX,startY,startAngle,100,"#0000ff",true);
	socket.emit("NWP", {name:playerName,x: startX, y: startY,angle: startAngle, life: 100});
};

// Socket disconnected
function onSocketDisconnect() {
	// Initialise remote players array
	remotePlayers = [];
	
	addLog("Disconnected from socket server","red");
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);
	addLog("New player connected: "+data.name,"blue");

	// Initialise the new player
	var newPlayer = new Player(data.name,data.x, data.y,data.angle,data.life,"#FF0000",false);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);

	// Player not found
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Update player position
	movePlayer.angle = data.angle;
	movePlayer.x 	 = data.x;
	movePlayer.y 	 = data.y;
};

// Remote player Fire
function onFireBullet(data) {
	bullets.push(new Bullet(data.id,data.x,data.y,data.angle));
};

// Remote player hit
function onPlayerHit(data) {
	var hitPlayer = playerById(data.id);

	// Player not found
	if (!hitPlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	hitPlayer.hit(data.hitBy);
	
};
// Remote player dead
function onPlayerDead(data) {
	var deadPlayer = playerById(data.id);

	// Player not found
	if (!deadPlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	deadPlayer.dead();
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	addLog(removePlayer.getName()+" has disconnected","red");
	
	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);


};
// general message received, mostly chatlog
function onMSG(msg) {
	addLog(msg.msg,msg.color);
};
// Player killed other player ,add stats
function onPlayerKill(data) {
	playerObj.addKill();
};

// Player killed other player ,add stats
function onPlayerStats(stats) {
	if (typeof statsBox != "undefined"){
		statsBox.setStats(stats);
	}
};