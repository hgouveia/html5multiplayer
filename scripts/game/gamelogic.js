/*_____________BASE ENGINE_________*/
function init() {
	//Init Canvas
    var c 			= document.getElementById("drawCanvas"),
    	canvasStyle	= window.getComputedStyle(c);

    canvasWidth 	= parseInt(canvasStyle.getPropertyValue('width')),
    canvasHeight 	= parseInt(canvasStyle.getPropertyValue('height'));
    c.width  		= canvasWidth;
	c.height 		= canvasHeight;
    ctx 			= c.getContext("2d");

    //Init Keyboard
    for (var i = 0; i < key.length; ++i) {key[i] = false; }
	document.addEventListener("keydown",function(e) {
		e = e || window.event;
	    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	    if (charCode > 0) {
	    	//console.debug("DOWN "+charCode);
	        key[charCode] = true;
	    }
	},false); 
	document.addEventListener("keyup",function(e) {
	    e = e || window.event;
	    var charCode = (typeof e.which == "number") ? e.which : e.keyCode;
	    if (charCode > 0) {
	    	//console.debug("UP "+charCode);
	        key[charCode] = false;
	    }
	},false);  

    //Init objects
    log 		= document.getElementById("log");
	remotePlayers = bullets = [];
	statsBox	= new StatsBox();

    //Run the game
	//loopInterval = setInterval(gameLoop,1000/60);
	lastTime = Date.now();
	(function animloop(){
	  requestAnimationFrame(animloop);
	  gameLoop();
	})();

	running = true;

	//Initialized Multiplayer
	connect();
}

function gameLoop(){

	if (running && ctx != undefined){
		update();
		render();
	}

}

var logTimer = 0;
function update(){
    var elapsedTime=parseFloat(Date.now()-lastTime)/1000;
	logTimer += elapsedTime;

    //Remove first element every 5secs from the Chatlog
    if (logTimer > 5 && log != undefined){
    	var span = log.firstChild;
    	if (span){
    		log.removeChild(span);
    	}
    	logTimer = 0;
    }

	if (typeof playerObj == "undefined") return;

	playerObj.update(elapsedTime);
	statsBox.update(elapsedTime);

	// Send local player data to the game server if detect movement
   	if (key[39] || key[37] || key[38] || key[40]){ 
  		socket.emit("MVP", {x: playerObj.x, y: playerObj.y,angle:playerObj.angle });
	}

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

function render() {
	ctx.clearRect(0,0,canvasWidth,canvasHeight);

	if (typeof playerObj != "undefined"){
		playerObj.draw();
	}

	for (var i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw();
	}

	for (var i = 0; i < bullets.length; i++) {
		bullets[i].draw();
	}

	//UI
	if (typeof playerObj != "undefined"){
		ctx.fillStyle = "#FFF";
		ctx.font = "14px Verdana";
		ctx.fillText("Dead: "+playerObj.getDead(), 10, 20);
		ctx.fillText("Kill: "+playerObj.getKill(), 100, 20);
		ctx.fillText("Press 'L' key to display stats", canvasWidth-220, 20);
	}
	if (typeof statsBox != "undefined"){
		statsBox.draw();
	}	
}