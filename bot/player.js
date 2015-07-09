var Bullet = require("./Bullet").Bullet;
var Player = function(playerName,startX, startY,startAngle) {
	
	//Private
	var	_this 		= this,
		life 		= 100,
		lifeDamage 	= 5,
		deadCount 	= 0,
		killCount 	= 0,
		_isDead		= false,
		width 	= 20,
		height 	= 20;

	//Public
	this.id 	= 0;
	this.x 		= startX;
	this.y 		= startY;
	this.angle 	= startAngle;
	this.name 	= playerName;	


 	// Getters and setters
 	this.getName = function(){
 		return name;
 	}
	this.setName = function(newName) {
		name = newName;
		fontWidth = name.length * fontSize; //108
		fontWidthHalf = (name.length/2) * 5;//(fontWidth/2); // 54		
	};

	this.isDead = function(){
		return _isDead;
	}


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
		_isDead = true;
		life = 100;
		deadCount++;
	}

	function wakeup(){
		life = 100;
		_isDead = false; 
	}

	this.update = function(elapsedTime){
		if (_isDead){
			time +=elapsedTime;
		}
   }
	this.getRect = function(){
		var hW = width/2;
		var hH = height/2;
		return { top: _this.y-hH , right: _this.x + hW , bottom: _this.y + hH, left: _this.x - hW};
	}   
	function setLastCoords(){
		_this.x = lastX;
		_this.y = lastY;
	}
	function isOutOfScreen(){
		var hW = width/2;
		var hH = height/2;
		return (_this.x+hW > canvasWidth || _this.y-hH < 0 ||	_this.y+hH > canvasHeight || _this.x-hW  < 0);  	
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;