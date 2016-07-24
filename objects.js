//generates the obstacles and speed ups
		//distributes the objects along the track randomly but with possible positions constrained only to the track
        function createRoadObjects(){
			//adds the tall obstacles
        	for (var i = 0; i < 50; i++) {
            	var location = -1 * Math.floor(Math.random()*19850);
            	var offset = Math.floor(Math.random()*50) - 25;
            	var obs = (new Obstacle(location, 10, offset, 20));
				obs.__dirtyPosition = true;
				obstacleList.push(obs);
				scene.add(obs.shape);
            }
			
			//adds the speed ups
			for (var i = 0; i < 20; i++) {
            	var location = -1 * Math.floor(Math.random()*19850);
            	var offset = Math.floor(Math.random()*40) - 20;
            	var speed = (new speedUp(location, 1, offset));
				speedUpList.push(speed.shape);
				scene.add(speed.shape);
            }
			
			//adds short obstacles
			for (var i = 0; i < 50; i++) {
            	var location = -1 * Math.floor(Math.random()*19850);
            	var offset = Math.floor(Math.random()*50) - 25;
            	var jump = (new Obstacle(location, 2.5, offset, 5));
				jump.__dirtyPosition = true;
				jumpList.push(jump);
				scene.add(jump.shape);
            }
        }
		
		//makes the ground object
        function createGround() {
            var texture = THREE.ImageUtils.loadTexture('images/asphaltPink.png');
			var material_image = new THREE.MeshPhongMaterial({map: texture});
			var ground_material = Physijs.createMaterial(material_image, 0.6, 0.0);

			groundHeight = 1;
            ground = new Physijs.BoxMesh(new THREE.BoxGeometry(20000, groundHeight, 60), ground_material, 0);
			
			ground.position.x = -9900;
			ground.position.y = 0;
			ground.position.z = 0;
        }
		
		//creates the avatar
		function createAvatar() {
			var texture = THREE.ImageUtils.loadTexture('images/snowrocks.png');
			var material_image = new THREE.MeshPhongMaterial({map: texture})
			//var avatarMaterial = Physijs.createMaterial(new THREE.MeshPhongMaterial({color: 0xbf80ff}),0.6,0.0);
			avatarHeight = 3;
			avatar = new Physijs.SphereMesh(new THREE.SphereGeometry(avatarHeight,30,30), material_image, 1);
			avatar.position.x = 20;
			avatar.position.y = 5;
			avatar.position.z = 0;
			
			scene.add(avatar);

		}
		//handles acceleration for the left movement
		function accelerateLeft() {
			var velVec = avatar.getLinearVelocity();
			velVec.z = Math.min(velVec.z + 2, 25);
			velVec.x /= 1.2;
			avatar.setLinearVelocity(velVec);
		}
		//handles acceleration for the right movement
		function accelerateRight() {
			var velVec = avatar.getLinearVelocity();
			velVec.z = Math.max(velVec.z - 2, -25);
			velVec.x /= 1.2;
			avatar.setLinearVelocity(velVec);
		}