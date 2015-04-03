/*_____________UTILS_________*/
function rand(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	
	return false;
};

//Degree to Radians
function toRad(degree){
	return degree * Math.PI/180;
}
//intersect between 2 rectangle
//format r1 = { left:0, right:0, bottom:0, top:0}
function intersectRect(r1, r2) {
  return !(r2.left > r1.right || 
           r2.right < r1.left || 
           r2.top > r1.bottom ||
           r2.bottom < r1.top);
}

function addLog(msg,color){
	logTimer = 0;
	color = (color==undefined)?"white":color;
	msg = '<span class="message '+color+'">'+msg+'</span>';
	log.innerHTML = log.innerHTML + msg;

	var scrollTop = log.scrollHeight;
	log.scrollTop = scrollTop;
}

function include(filename){
    var head = document.getElementsByTagName('head')[0];

    var script = document.createElement('script');
    script.src = filename;
    script.type = 'text/javascript';

    head.appendChild(script)
}