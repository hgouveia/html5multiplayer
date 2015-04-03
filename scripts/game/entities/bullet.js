/*_____________BULLET_________*/
var Bullet = function(_id,_x,_y,_angle){
	//Private
	var _this 	= this,
		width 	= 5,
		height 	= 1,
		speed 	= 10,
		color 	= "#FFA420",
		angle 	= _angle,
		x 		= _x,
		y 		= _y;

	//Public 
	this.id = _id;

	this.getRect = function (){
		return { top: y , right: x + width , bottom: y + height, left: x };
	}
	

	this.update = function(){
		advance(speed);
	}

	this.draw = function(){

		if (ctx != undefined){
			ctx.save();

		 	ctx.fillStyle = color;
			ctx.translate( x,  y   );
			ctx.rotate(toRad(angle));
		ctx.fillRect(-width/2+15,-height/2,width,height);

		ctx.restore();//--to just rotate that state
		}

	}

	this.getX = function() {
		return x;
	};

	this.getY = function() {
		return y;
	};

	this.getAngle = function() {
		return angle;
	};


	// Private
	function advance(_speed){

	  var ang = (angle < 0) ? (angle % 360) + 360: angle % 360;

	  x += _speed * Math.cos( toRad(ang) );
	  y += _speed * Math.sin( toRad(ang) );

	}

}/*__ END Bullet */