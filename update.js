//updates the objects
		function updateRoadObjects(){
			//for every obstacle we update
			for(var i = 0; i < obstacleList.length; i++) {
				obstacleList[i].shape.__dirtyPosition = true;
				obstacleList[i].shape.position.x += groundVelocity;
				obstacleList[i].shape.position.y = 10;
			}
			//for every jump we update
			for(var i = 0; i < jumpList.length; i++) {
				jumpList[i].shape.__dirtyPosition = true;
				jumpList[i].shape.position.x += groundVelocity;
				jumpList[i].shape.position.y = 2.5;
			}
			//for every speed up we update
			for(var i = 0; i < speedUpList.length; i++) {
				speedUpList[i].__dirtyPosition = true;
				speedUpList[i].position.x += groundVelocity;
				speedUpList[i].position.y = 1;
				//checks if we have collided with a speed up object and removes it and increases the velocity if we have
				if((speedUpList[i].position.x > avatar.position.x - 3) && (speedUpList[i].position.z > avatar.position.z - 9) && (speedUpList[i].position.z < avatar.position.z + 9) && (avatar.position.y < 4)) {
					scene.remove(speedUpList[i]);
					speedUpList.splice(i, 1);
					if(groundVelocity < maxGroundVelocity) {
						groundVelocity += 0.5;
					}
				}					
			}
		}
		//updates the timer
		function updateTimer(){
			var newTime = new Date();
            var timeSinceStart = (newTime.getTime()-baseMilliseconds).toString(10);
           	milliseconds = timeSinceStart.slice(-3);
           	seconds = timeSinceStart.slice(0,timeSinceStart.length-3);
           	if(seconds === ""){
           	    seconds = 0;
          	}
           	document.getElementById('timer').innerHTML = "Timer: "+seconds +":"+milliseconds;
		}
		//checks if the player has won or lost
		function checkGameOver(){
			//player wins if the reach the end of the track
			if (avatar.position.y < 0 && camera.position.x < ground.position.x-10000 && camera.position.x > avatar.position.x) {
            	gameOver = true;
           		document.getElementById('endtext').style.visibility = "visible";
           		document.getElementById('endtext').innerHTML = "Congratulations, you reached the end!<br>Your Final Time Was:<br>" +seconds +":"+milliseconds +"<br><br>Click Here to play again!";
            	camera.position.x = ground.position.x;	
            	skyboxMesh.position.x = ground.position.x;
            	groundVelocity=baseGroundVelocity;
           	//player loses if they fall off either side, get knocked behind the camera, or get sent flying by an obstacle
			} else if (avatar.position.y < 0 || avatar.position.x-avatarHeight >= camera.position.x || avatar.position.z > 30 || avatar.position.z < -30 || avatar.position.y > 75) {
           		gameOver = true;
           		document.getElementById('endtext').style.visibility = "visible";
           		document.getElementById('endtext').innerHTML = "You lost! Click here to play again!";
            	camera.position.x = ground.position.x;
            	skyboxMesh.position.x = ground.position.x;
            	groundVelocity=baseGroundVelocity;
            }
		}
		//updates the ground posiition and other objects
		function update() {
			ground.__dirtyPosition = true;
			ground.position.x += groundVelocity;
			updateRoadObjects();

			if (!gameOver) {
				avatar.__dirtyRotation = true;
				//sets the avatar to rotate for the effect of rolling
				avatar.rotation.z += 0.1;
				avatar.rotation.x = 0;
				avatar.rotation.y = 0;
				//if the ball gets hit too far forward we catch up with it
				if (camera.position.x - avatar.position.x > 30) {
					camera.position.x = avatar.position.x + 30;
				}
				var xVel = avatar.getLinearVelocity().x;
				updateTimer();
            	checkGameOver();
			}			
		}


        window.onload = initScene;