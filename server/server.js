var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"),
	express = require('express'),ejsEngine = require('ejs-locals'),				
	Player = require("./Player").Player;

var port = 8000;
var expressServer;
var clients;

//Initializ the server
function initialize(){
	players = clients = [];


	expressServer = app.listen(port);

	socket = io.listen(expressServer);
	socket.sockets.on("connection", socketEvents);	

	util.log("Server Listening on port: "+port);

}

//Handle Sockets Event
function socketEvents(client) {
	util.log("New player has connected: "+client.id);
	clients[client.id] = client;
	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("NWP", onNewPlayer);

	// Listen for move player message
	client.on("MVP", onMovePlayer);

	// Listen for player fire
	client.on("BLP", onFireBullet);	

	// Listen for player hit
	client.on("HTP", onPlayerHit);	

	// Listen for player dead
	client.on("DEP", onPlayerDead);	

	// Listen for player stats request
	client.on("PST", onPlayerStats);	

	//The following messages are processed by the client side, the server just emits the message to all players
	//[RMP] Player Removed : emitted from Disconnect event
	//[MSG] General message: emitted from onPlayerDead [DEP] event only for now
	//[KLL] Player Kill: emitted from onPlayerDead [DEP] event
	
};


// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("RMP", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	
	util.log("New player has join: "+data.name+" - ["+this.id+"]");

	// Create a new player
	var newPlayer = new Player(data.name,data.x, data.y,data.angle);
	newPlayer.id = this.id;
	
	// Broadcast new player to connected socket clients
	this.broadcast.emit("NWP", {id: newPlayer.id, name : newPlayer.name,x: newPlayer.x, y: newPlayer.y,angle : newPlayer.angle,life: newPlayer.getLife()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("NWP", {id: existingPlayer.id, name : existingPlayer.name,x: existingPlayer.x, y: existingPlayer.y,angle: existingPlayer.angle, life: existingPlayer.getLife()});
	};
		
	// Add new player to the players array
	players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.angle = data.angle;
	movePlayer.x = data.x;
	movePlayer.y = data.y;


	// Broadcast updated position to connected socket clients
	this.broadcast.emit("MVP", {id: movePlayer.id, x: movePlayer.x, y: movePlayer.y, angle: movePlayer.angle});
};

// Player fire
function onFireBullet(data) {
	var firePlayer = playerById(this.id);
	this.broadcast.emit("BLP", {id:firePlayer.id,x: data.x, y: data.y, angle: data.angle });
};

// Player fire
function onPlayerHit(data) {
	var hitPlayer = playerById(this.id);

	hitPlayer.hit();
	this.broadcast.emit("HTP", {id: hitPlayer.id,hitBy:data.hitBy});
};

// Player Dead
function onPlayerDead(data) {
	var deadPlayer = playerById(this.id);
	deadPlayer.dead();

	var killerBy = "";
	if (data.killById != -1){
		var killerPlayer = playerById(data.killById);
		killerPlayer.addKill();
		killerBy = killerPlayer.name;

		clients[data.killById].emit("KLL",{});
	}

	util.log("Player "+deadPlayer.name+" was killed by "+killerBy);

	//Broadcast To all
	socket.emit('MSG', { msg: '<b class="red">'+deadPlayer.name+'</b> was killed by <b class="green">'+killerBy+'</b>', color: 'blue'});

};

//Player stats
function onPlayerStats(data) {
	var stats = [];
	for (var i = 0; i < players.length; i++) {
		stats.push({'name':players[i].name,'kill':players[i].getKill(),'dead':players[i].getDead()});
	}

	//emits to the same client as a response
	clients[this.id].emit("PST",stats);
}

/*_____________UTILS_________*/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	
	return false;
};

/*_____________EXPRESS_________*/
var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('.html', ejsEngine);
app.use(express.static(__dirname));


app.get('/', function (req, res) {
  res.render('layout',{ body: "<h1>Server</h1>" });
});

app.get('/list', function (req, res) {
	res.render('playerlist', { players: players });
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*_____________RUN THE SERVER_________*/
initialize();