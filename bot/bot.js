//Global
global.bullets = [];
global.remotePlayers = [];
global.canvasWidth=1024;//1280
global.canvasHeight=650;//768

//Require
var io = require('socket.io-client'),
	express = require('express'),ejsEngine = require('ejs-locals'),	
	Player = require("./Player").Player,
	PlayerBot = require("./PlayerBot").PlayerBot,
	Bullet = require("./Bullet").Bullet;

//Local Vars
var running=false,loopInterval,
	lastTime = 0,playerObj,
	host="localhost",port = 8000;



/*_____________ SERVER_________*/

function connect(){
	//Server not found
 	if (typeof io == "undefined") return;

	// Initialise socket connection
	//socket = io.connect(host, {port: port});
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
	console.log("Connected to "+host+":"+port+" server");
	
	// Send local player data to the game server
    var playerName = "ImBot",	
    	bounds = 100,
    	startX = rand(bounds,canvasWidth-bounds),
		startY = rand(bounds,canvasHeight-bounds),
		startAngle = 0;

	playerObj = new PlayerBot(playerName,startX,startY,startAngle,100,"#0000ff",true);
	console.log("INIT: ",playerName,"|",startX,"|",startY,"|",startAngle);
	socket.emit("NWP", {name:playerName,x: startX, y: startY,angle: startAngle, life: 100});

    //Run the game
    lastTime = Date.now();
	loopInterval = setInterval(gameLoop,1000/60);
	running = true;
};

// Socket disconnected
function onSocketDisconnect() {
	// Initialise remote players array
	remotePlayers = [];
	
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.name,data.x, data.y,data.angle);
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

	console.log(removePlayer.getName()+" has disconnected");
	
	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);


};
// general message received, mostly chatlog
function onMSG(msg) {
	console.log(msg.msg);
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


/*_____________GAME LOGIC_________*/
function gameLoop(){

	if (running){
		update();
	}
}

function update(){
    var elapsedTime=parseFloat(Date.now()-lastTime)/1000;

	if (typeof playerObj == "undefined") return;

	playerObj.update(elapsedTime);

	for (var i = 0; i < remotePlayers.length; i++) {
		
		var remotePlayer = remotePlayers[i];
		remotePlayer.update(elapsedTime);

		if (intersectRect(playerObj.getRect(),remotePlayer.getRect()) && !remotePlayer.isDead() && !playerObj.isDead()){
			//playerObj.setLastCoords();
			//addLog("INTERSECT");
		}
	}


	//Update Bullets, if go off the screen, delete
	for (var i = 0; i < bullets.length; i++) {
		var bullet = bullets[i];

		if (bullet.x > canvasWidth || bullet.x < 0 ||
			bullet.y > canvasHeight || bullet.y < 0){

			bullets.splice(bullets.indexOf(bullet), 1);

		}else{
			bullet.update();

			if (intersectRect(bullet.getRect(),playerObj.getRect()) && !playerObj.isDead() && bullet.id != playerObj.id){
			 	bullets.splice(bullets.indexOf(bullet), 1);
				playerObj.hit(bullet.id);
			 	socket.emit("HTP", {id:playerObj.id,hitBy:bullet.id} );
			}

			//see all players if they are hit
			for (var j = 0; j < remotePlayers.length; j++) {
				var remotePlayer =  remotePlayers[j];
				if (intersectRect(bullet.getRect(),remotePlayer.getRect()) && !remotePlayer.isDead() && bullet.id != remotePlayer.id){
				 	bullets.splice(bullets.indexOf(bullet), 1);
				}

			}
		}
		
	}	

	lastTime=Date.now();
}

/*_____________UTILS_________*/
global.rand = function(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Find player by ID
global.playerById = function(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

//Degree to Radians
global.toRad  = function(degree){
	return degree * Math.PI/180;
}
global.toDegree = function(rad){
	return rad * 180/Math.PI;
}
//intersect between 2 rectangle
//format r1 = { left:0, right:0, bottom:0, top:0}
global.intersectRect = function(r1, r2) {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

/*_____________INIT SERVER_________*/
connect();