'use strict';
var scale = chroma.scale(['green', 'white']);
Physijs.scripts.worker = '../libs/physijs_worker.js';
Physijs.scripts.ammo = '../libs/ammo.js';

var initScene, render, applyForce, setMousePosition, mouse_position, ground_material, box_material, renderer, render_stats, scene, ground, light, camera, box, boxes = [], avatar, groundHeight, avatarHeight, skyboxMesh, milliseconds, seconds, gameOver = false, accel = null;

//Set the initial time for the timer
var baseTime = new Date();
var baseMilliseconds = baseTime.getTime();
		

		
		function speedUp(x, y, z) {
			var texture = THREE.ImageUtils.loadTexture('images/speedup.png');
			var material_image = new THREE.MeshPhongMaterial({map: texture});
			//var material = new THREE.MeshPhongMaterial({color: 0x99ffbb});
			this.shape = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 20), material_image, 0);
			this.shape.position.x = x;
			this.shape.position.y = y;
			this.shape.position.z = z;
		}
		speedUp.prototype.constructor = speedUp;
		
		function Obstacle(x, y, z, height) {
			var texture = THREE.ImageUtils.loadTexture('images/wood.png');
			var material_image = new THREE.MeshPhongMaterial({map: texture});
			//var material = Physijs.createMaterial(new THREE.MeshPhongMaterial({color: 0xffff99}), 0.5, 0);
			this.shape = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, height, 40), material_image, 0);
			this.shape.position.x = x;
			this.shape.position.y = y;
			this.shape.position.z = z;
		}
		Obstacle.prototype.constructor = Obstacle;
		
		var groundVelocity, baseGroundVelocity, maxGroundVelocity;
		var obstacleList = [];
		var speedUpList = [];
		var jumpList = [];
		
		
		initScene = function () {

            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(window.innerWidth, window.innerHeight);

            renderer.setClearColor(new THREE.Color(0x9F0F00));
            document.getElementById('viewport').appendChild(renderer.domElement);
			document.getElementById('timer').innerHTML = "Timer: 0:0";

            render_stats = new Stats();
            render_stats.domElement.style.position = 'absolute';
            render_stats.domElement.style.top = '1px';
            render_stats.domElement.style.zIndex = 100;
            document.getElementById('viewport').appendChild(render_stats.domElement);
		

            scene = new Physijs.Scene;
            scene.setGravity(new THREE.Vector3(0, -20, 0));
			
			//creates the skybox
			var path = "SkyBox/";
			 var format = '.png';
			 var urls = [
				 path + 'px' + format, path + 'nx' + format,
				 path + 'py' + format, path + 'ny' + format,
				 path + 'pz' + format, path + 'nz' + format
			 ];

			 var textureCube = THREE.ImageUtils.loadTextureCube( urls );
			 
			 var shader = THREE.ShaderLib[ "cube" ];
			 shader.uniforms[ "tCube" ].value = textureCube;

			 var skymaterial = new THREE.ShaderMaterial( {
				 fragmentShader: shader.fragmentShader,
				 vertexShader: shader.vertexShader,
				 uniforms: shader.uniforms,
				 depthWrite: false,
				 side: THREE.BackSide
				 }
			);
			
			skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), skymaterial);
			scene.add(skyboxMesh);
			
			//creates listener for the audio
			var listener = new THREE.AudioListener();
			var backgroundMusic = new THREE.Audio(listener);
			backgroundMusic.load('../sounds/Hard_Tec-Mike-9959_hifi.mp3');
			
			backgroundMusic.setRefDistance(20);
			backgroundMusic.setLoop(true);
			backgroundMusic.setRolloffFactor(2);
			
			//creates camera and adds the audio to it
            camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);

            camera.position.set(50, 10, 0);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
			camera.add(listener);
			camera.add(backgroundMusic);
            scene.add(camera);
			
            //Creates a hemisphere light
			
			light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 )
            light.position.set(400, 1000, 0);
            scene.add(light);
		
			//sets the base velocity and max velocity
			baseGroundVelocity = 5;
			maxGroundVelocity = 7;
			groundVelocity = baseGroundVelocity;

			
            //makes the track and all the objects
			createGround();
			createRoadObjects();
            scene.add(ground);

			//makes the avatar adn the event listeners
			createAvatar();
			createEventListeners();

            requestAnimationFrame(render);

        };
		
		//renders game
        render = function () {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
            render_stats.update();
			update();

            scene.simulate(undefined, 1);


        };
        
        //creates the event listeners
		function createEventListeners() {
			//when button is first pressed
			function keyDownListener( event ) {
				 switch( event.keyCode ) {
				 case 32: /* spacebar*/ 
				 	if(avatar.position.y-avatarHeight <= ground.position.y+groundHeight/2){
				 		avatar.setLinearVelocity(new THREE.Vector3(0,15,0));
				 	}
				 	break;
				 case 37: /*left*/
				 	clearInterval(accel);
				 	accel = setInterval(accelerateLeft, 10); 
				 	break; 
				 case 39: /*right*/
				 	clearInterval(accel);
				 	accel = setInterval(accelerateRight, 10); 
					break;
				 }
			}
			//when button is released
			function keyUpListener( event ) {
				 switch( event.keyCode ) {
				 case 32: /* spacebar*/ 
				 	if(avatar.position.y-avatarHeight <= ground.position.y+groundHeight/2){
				 		avatar.setLinearVelocity(new THREE.Vector3(0,10,0));
				 	}
				 	break;
				 case 37: /*left*/
				 	clearInterval(accel);
				 	break;  
				 case 39: /*right*/
				 	clearInterval(accel);
				 	break;
				 }
			}
			//handles collisions with the obstacles which causes the velocity to go back to the base
			function avatarCollide(collisionObject, linearVelocity, angularVelocity) {
				if(collisionObject instanceof Physijs.CylinderMesh) {
					groundVelocity = baseGroundVelocity;
				}
			}
			//adds listeners
			document.addEventListener("keydown",keyDownListener,false);
			document.addEventListener("keyup", keyUpListener, false);
			avatar.addEventListener('collision', avatarCollide);
		}

