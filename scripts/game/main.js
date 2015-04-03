//Global vars across all files
var ctx,loopInterval,lastTime = 0,log,
	canvasWidth=1280,canvasHeight=768,
	running=false,key= new Array(255),
	playerObj,statsBox,remotePlayers, bullets,
	host="localhost", port = 8000;

//File Inclusion
include("scripts/libs/socket.io-client/socket.io.js");
include("scripts/game/entities/player.js");
include("scripts/game/entities/bullet.js");
include("scripts/game/entities/statsbox.js");
include("scripts/game/multiplayer.js");
include("scripts/game/gamelogic.js");
	
//calls init function whenever the page gets fully loaded
window.addEventListener("load",function(){

	init();

},true);
