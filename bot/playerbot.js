var Bullet = require("./Bullet").Bullet;
/*_____________PLAYER_________*/
var PlayerBot = function(_name,_x,_y,_angle,_life,_color,_isLocalPlayer){

	//Private
	var _this 	= this,
		width 	= 20,
		height 	= 20,
		speed 	= 2,
		life 	= 100,
		lifeDamage = 5,
		deadCount = 0,
		killCount = 0,
		_isDead	= false, //to avoid conflict with dead() function
		ammo	= 1000,
		alpha 	= 1,
		isLocalPlayer = true,
		lastX = 0, lastY = 0, elapseTime,target,playerState;

	//STATE
	var STATE = {
	  IDLE : 1,
	  WAIT_FOR_TARGET : 2,
	  CHASING_TARGET : 3, 
	  CHASING_FIRE_TARGET: 4, 
	  AVOID_TARGET : 5,
	  MOVE_RANDOM: 6
	};

	//Update var helpers
	var lastState = "",time=0, fireRate=0,flickeringToggle=false,blockCount = 0,waitTime = 0;

	//Public
	this.x = 0, this.y = 0, this.id = 0,this.angle = 0;
	

	// constructor 
	var __construct = function(name_,x_,y_,angle_,life_) {
		if (angle_ != undefined){ _this.angle = angle_; }
		if (x_ != undefined){ _this.x = lastX = x_; }
		if (y_ != undefined){ _this.y = lastY = y_; }
		if (life_ != undefined){ life = life_; }
		
		if (name_ != undefined){ 
			name = name_;
		}

		
	}(_name,_x,_y,_angle,_life);

	playerState = STATE.IDLE;

	this.parent_hit =  function(killById){
		if (life > 0){
			life -= lifeDamage;
		}

		if (life <= 0 && !_isDead){  
			_this.dead(killById); 
		}

	}
	this.addKill = function() {
		killCount++;
	};	
	this.hit =  function(hitById){
		_this.parent_hit(hitById);
		target = playerById(hitById);
		playerState = STATE.CHASING_FIRE_TARGET;
	}
	this.isDead = function(){
		return _isDead;
	}
	this.dead = function(killById){
		_isDead = true;
		deadCount++;
		setTimeout(function(){  wakeup(); },1500);
		
		if (_isLocalPlayer){
			killById = (killById == undefined)?-1:killById;
			socket.emit("DEP", {killById:killById});
		}

	}
	this.getRect = function(){
		var hW = width/2;
		var hH = height/2;
		return { top: _this.y-hH , right: _this.x + hW , bottom: _this.y + hH, left: _this.x - hW};
	}
	this.update = function(elapsedTime){
		if (_isDead){
			time +=elapsedTime;

			//flickering
			if (time > 0.1){
				time = 0;
				alpha = (flickeringToggle)?1:0.5;
				flickeringToggle = !flickeringToggle;
			}
		}

		var targetDistance;
		if (target){
			targetDistance = distance(target);

			if (targetDistance > 300) { target = undefined; playerState = STATE.IDLE;}
			if (targetDistance  < 81) { playerState = STATE.AVOID_TARGET; }
		}else{
			if (remotePlayers.length == 0){
				playerState = STATE.IDLE;
			}
		}

		//If there is others players, and the bot is not moving
		//trigger the waiting timer
		if (remotePlayers.length > 0 && playerState === STATE.IDLE){
			waitTime +=elapsedTime;
		}

		//if wait is greater than 15 secs, change the angle
		if (waitTime > 15){
			if(checkAngle()){
				waitTime = 0;
				blockCount = 0;
				console.log("CHANGE ANGLE");
				playerState = STATE.MOVE_RANDOM;
			}
		}
	
	
		switch(playerState){
			case STATE.IDLE:
				//TODO: only search for the ones near the player, and get the closet one
				for (var i=0; i < remotePlayers.length; i++){
					var rPlayer = remotePlayers[i];

					var targetDistance = distance(rPlayer);
					if (target == undefined && targetDistance != NaN && targetDistance  < 300 ){
						target = rPlayer;
						playerState = STATE.WAIT_FOR_TARGET;
				
					}
				}
				
				if (remotePlayers.length == 0 && lastState != playerState){
					console.log("IDLE");
				}

				if (remotePlayers.length > 0 && lastState != playerState){
					console.log("SEARCHING TARGET");
				}
			break;
			case STATE.WAIT_FOR_TARGET:
				if (targetDistance > 80 && targetDistance < 300) { 
					playerState = STATE.CHASING_FIRE_TARGET;
				}
				if (lastState != playerState){
					console.log("WAITING FOR TARGET [distance 80-300px]");
				}
			break;
			case STATE.CHASING_TARGET:
				var tAngle = getTargetAngle(target);
				_this.angle = toDegree(tAngle);
				advance(speed);
				if (lastState != playerState){
					console.log("CHASING TARGET");
				}	
			break;
			case STATE.CHASING_FIRE_TARGET:
				var tAngle = getTargetAngle(target);
				_this.angle = toDegree(tAngle);


				advance(speed);
				 
				//FIRE 
				if ( targetDistance  < 200 ){
					fireRate +=elapsedTime;

					//flickering
					if (fireRate > 0.1){
						fireRate = 0;
						bullets.push(new Bullet(_this.id,_this.x,_this.y,_this.angle));
						socket.emit("BLP", {id:_this.id,x: _this.x, y: _this.y, angle: _this.angle });	
					}
				}
				if (lastState != playerState){
					console.log("CHASING TARGET AND FIRE ");
				}	
			break;
			case STATE.AVOID_TARGET:
				var tAngle = getTargetAngle(target);
				_this.angle = -toDegree(tAngle);

				//checkAngle();

				advance(speed);
				if (lastState != playerState){
					console.log("AVOIDING TARGET ");
				}					
			break;
			case STATE.MOVE_RANDOM:
				advance(speed);

				if ( isOutOfScreen()){
					_this.angle = rand(0,360);
				}

				if (lastState != playerState){
					console.log("MOVING RANDOMLY");
				}	
			break;
		}

		lastState = playerState;

		if (playerState != undefined && playerState != STATE.IDLE){
			socket.emit("MVP", {x: _this.x, y: _this.y,angle:_this.angle });
		}

		if ( isOutOfScreen()){
			_this.x = lastX;
			_this.y = lastY;
		}

		lastX = _this.x;
		lastY = _this.y;		
	}
	


   //Private - non inherited
	function checkAngle(){
		if (isBlock){
			blockCount++;
			if (blockCount>100){
				_this.angle = rand(0,360);
				return true;
			}
		}
		return false;
	}
	function isBlock(){
		return (_this.x == lastX &&	_this.y == lastY);
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
	function advance(_speed){

		var ang = (_this.angle < 0) ? (_this.angle % 360) + 360: _this.angle % 360;

		_this.x += _speed * Math.cos( toRad(ang) );
		_this.y += _speed * Math.sin( toRad(ang) );

	}

	function wakeup(){
		life = 100;
		_isDead = false; 
	}

	function distance(_target){
		//console.log("THIS: ", _this.x,"|",_this.y," TARGET: ",_target.x,"|",_target.y);
		var dX = (_target.x - _this.x) * (_target.x - _this.x);
		var dY = (_target.y - _this.y) * (_target.y - _this.y);
		var d = Math.sqrt(dX + dY);
		//var d = 0.5 * (dX + dY + Math.max(dX, dY));

		return d;
			
	}

	function getTargetAngle(_target){
		var dX = _target.x - _this.x;
		var dY = _target.y - _this.y;
		var targetAngle = Math.atan2(dY,dX);
		return targetAngle;
	}

}
//inherit
//PlayerBot.prototype = new Player;
exports.PlayerBot = PlayerBot;
/*__ END PLAYER BOT */