/*_____________PLAYER_________*/
var Player = function(_name,_x,_y,_angle,_life,_color,_isLocalPlayer){
	
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
		name 	= "",
		color 	= "#0000ff",
		isLocalPlayer = true,
		fontWidth = 0, fontSize = 12,fontWidthHalf = 0,
		lastX = 0, lastY = 0, elapseTime;

	//Update var helpers
	var lastState = false; var time=0; flickeringToggle=false;
	
	//Public
	this.x = 0, this.y = 0, this.id = 0,this.angle = 0;

 	// Getters and setters
 	this.getName = function(){
 		return name;
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
	this.setName = function(newName) {
		name = newName;
		fontWidth = name.length * fontSize; //108
		fontWidthHalf = (name.length/2) * 5;//(fontWidth/2); // 54		
	};
	this.addKill = function() {
		killCount++;
	};	

	this.isDead = function(){
		return _isDead;
	}

	this.getRect = function(){
		var hW = width/2;
		var hH = height/2;
		return { top: _this.y-hH , right: _this.x + hW , bottom: _this.y + hH, left: _this.x - hW};
	}
	this.hit =  function(killById){
		if (life > 0){
			life -= lifeDamage;
		}

		if (life <= 0 && !_isDead){  
			_this.dead(killById); 
		}

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

		//Keyboard
		if (isLocalPlayer){

			if (!_isDead){
			   	// Space - FIRE
			   	currentState = key[32];
			   	if (currentState != lastState){  
			   		bullets.push(new Bullet(_this.id,_this.x,_this.y,_this.angle));
			   		socket.emit("BLP", {id:_this.id,x: _this.x, y: _this.y, angle: _this.angle });
			   	}
				lastState = key[32];
			}

		   	// Right
			if (key[39]){ _this.angle +=speed; }
			//Left
			if (key[37]){ _this.angle -=speed; }
			//Up
			if (key[38]){ advance(speed) }
			//Down
			if (key[40]){ advance(-speed) }
		
			if ( isOutOfScreen()){
				_this.x = lastX;
				_this.y = lastY;
			}

			lastX = _this.x;
			lastY = _this.y;
		}
   }


   this.draw = function (){
   	if (ctx != undefined){

   		if (_isDead) { ctx.globalAlpha=alpha; }

   		
   		ctx.save(); //Save State - saved to be able to rotate only the following draw

   		//Body
	 	ctx.fillStyle = color;
   		ctx.translate( _this.x,  _this.y   );
   		ctx.rotate(toRad(_this.angle));
		ctx.fillRect(-width/2,-height/2,width,height);
		
		//Cannon
		var cW = 10, cH = 3;
		ctx.fillStyle = "#999";
		ctx.fillRect(width-cW,-cH/2,cW,cH);
		
		ctx.restore(); //End state

		//Life bar
		var lW = lWMax = 30, lH = 5,lC = "#00FF00";

		if ( life <= 100){ lC = "#00FF00"; } //Green - 00FF00
		if ( life <= 75){ lC = "#FFFF00"; } //Yellow - FFFF00
		if ( life <= 50){ lC = "#FFA420"; } //Orange - FFA420
		if ( life <= 25){ lC = "#FF0000"; } //Red	 - FF0000
		
		lW = (life * lWMax) / 100; 
		ctx.fillStyle = lC;
		ctx.fillRect(_this.x-lW/2,_this.y-30,lW,lH);

		//Name
		ctx.fillStyle = "#FFF";
		ctx.font = fontSize+"px Verdana";
		ctx.fillText(name, _this.x-fontWidthHalf, _this.y-40);

		//Restore Alpha
		ctx.globalAlpha = 1;
   	}
   }

   //Private
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

	// constructor 
	var __construct = function(name_,x_,y_,angle_,life_,color_,isLocalPlayer_) {
		if (color_ != undefined){ color = color_; }
		if (angle_ != undefined){ _this.angle = angle_; }
		if (isLocalPlayer_ != undefined){ isLocalPlayer = isLocalPlayer_; }
		if (x_ != undefined){ _this.x = lastX = x_; }
		if (y_ != undefined){ _this.y = lastY = y_; }
		if (life_ != undefined){ life = life_; }
		
		if (name_ != undefined){ 
			name = name_;
			fontWidth = name.length * fontSize; //108
			fontWidthHalf = (name.length/2) * 6;//(fontWidth/2); // 54
		}
	}(_name,_x,_y,_angle,_life,_color,_isLocalPlayer);




		
}/*__ END PLAYER */