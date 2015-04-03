/*_____________StatsBox_________*/
var StatsBox = function(){
	
	//Private
	var _this 	= this,
		x 		= 0,
		y 		= 0,
		width	= 600,
		height 	= 400,
		lastState = false,
		tableImage = undefined,
		imageReady = false;
	

	var __construct = function() {
		//Center
		x = (canvasWidth-width)/2;
		y = (canvasHeight-height)/2;
	}();


	this.setStats = function(statsData){
		imageReady = false;

		var statsTable 	= '<table style="width:'+width+'px;">';
			statsTable += '<tr><td>Player</td><td>Kill</td><td>Dead</td></tr>';

		//Create the table from the statsData
		for(var i=0; i < statsData.length; i++){
			var playerStat = statsData[i];
			statsTable +="<tr><td>"+playerStat.name+"</td><td>"+playerStat.kill+"</td><td>"+playerStat.dead+"</td></tr>";
		}

		statsTable +="</table>";

		var data = "<svg xmlns='http://www.w3.org/2000/svg' width='"+width+"' height='"+height+"'>" +
		             "<foreignObject width='100%' height='100%'>" +
		               "<div xmlns='http://www.w3.org/1999/xhtml' style='color:white; font-size:14px;'>" +
		               		"<div xmlns='http://www.w3.org/1999/xhtml' style='background:blue; opacity:0.2; position:absolute; top:0; left:0;right:0; bottom:0;'></div>" +
		                  statsTable+
		               "</div>" +
		             "</foreignObject>" +
		           "</svg>";
	
		//Prepare the image
		var DOMURL = self.URL || self.webkitURL || self;
		var svg = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
		var url = DOMURL.createObjectURL(svg);
		tableImage = new Image();
		tableImage.onload = function() {
		    DOMURL.revokeObjectURL(url);
		    imageReady = true;
		};
		tableImage.src = url;
	}
	
	this.update = function(elapsedTime){
		var TRIGGER_KEY = 76; //L KEY

		//Emit message just once
		currentState = key[TRIGGER_KEY];
		if (currentState != lastState){  
			socket.emit("PST", {});
		}
		lastState = key[TRIGGER_KEY];
	  
	  	if (key[TRIGGER_KEY]){ 
	  		isVisible = true; 
	  	}else{
	  		isVisible = false;
	  	}
		
   }

   this.draw = function (){
   	if (ctx != undefined && imageReady && isVisible){
   		ctx.drawImage(tableImage, x, y);
   	}
   }
		
}/*__ END PLAYER */