var Player = function(playerName,startX, startY,startAngle) {
	
	//Private
	var	_this 		= this,
		life 		= 100,
		lifeDamage 	= 5,
		deadCount 	= 0,
		killCount 	= 0;

	//Public
	this.id 	= 0;
	this.x 		= startX;
	this.y 		= startY;
	this.angle 	= startAngle;
	this.name 	= playerName;	

	this.getLife = function() {
		return life;
	};
	this.getDead = function() {
		return deadCount;
	};
	this.getKill = function() {
		return killCount;
	};
	this.addKill = function() {
		killCount++;
	};

	this.hit = function(){
		if (life > 0){
			life -= lifeDamage;
		}
	}
	this.dead = function(){
		life = 100;
		deadCount++;
	}

};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;