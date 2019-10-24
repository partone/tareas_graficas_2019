var renderer = null,
scene = null,
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
dice = null,
raycaster = null,
group = null;

var robot_mixer = {};
var deadAnimator;
var morphs = [];
var robots = [];
var robotAnimations = [];  //Yay! Camelcase!
var robotMixers = [];
var mouse = null;

var loopAnimation = 1;
var health = 25;
var score = 0;

var moveDistance = 300;
var animationDuration = 900;

var currentTime = Date.now();

var game = 0;

var animation = "idle";


function createDeadAnimation()
{

}

function loadFBX(x, z)
{
    var loader = new THREE.FBXLoader();
    loader.load( '../models/Robot/robot_idle.fbx', function ( object )
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.position.x = 40;
        object.position.z = 40;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;
        loadDice();
        //scene.add( robot_idle );

        createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();
        //Add animation to array for later use
        object.animations[0].name = "idle";
        robotAnimations.push(object.animations[0]);



        loader.load( '../models/Robot/robot_run.fbx', function ( object )
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
            object.animations[0].name = "run";
            robotAnimations.push(object.animations[0]);
            loader.load( '../models/Robot/robot_atk.fbx', function ( object )
            {
                robot_mixer["attack"] = new THREE.AnimationMixer( scene );
                robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
                object.animations[0].name = "attack";
                robotAnimations.push(object.animations[0]);
                loader.load( '../models/Robot/robot_walk.fbx', function ( object )
                {
                    robot_mixer["walk"] = new THREE.AnimationMixer( scene );
                    robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
                    object.animations[0].name = "walk";
                    robotAnimations.push(object.animations[0]);
                    addRobotHoard();
                    game = 1;
                } );
            } );


        } );


    } );
}

function getRandomX() {
  //Make X or Y randomly negative for robot distribution
  randomNegX = Math.floor(Math.random() * 2);
  if(randomNegX == 0) {randomNegX = -1;}
  //Distribute robots
  var topOrSide = Math.floor(Math.random() * 2);
  //If the robot generates above or below the FOV
  if(topOrSide == 0) {
    var randomX = (Math.floor(Math.random() * 400) - 200) * randomNegX;   //Random length-wise
  } else {
    //If the robot generates to the left or right of the FOV
    var randomX = 200 * randomNegX;
  }
  return randomX;
}

//Generate the robots
function addRobotHoard(robot_mixer) {
  //Make random range 150 < x < -150, 150 < y < 150
  //Y is the rotation we care about
  for (i = 0; i < 10; i++) {
    var tmp = cloneFbx(robot_idle);

    //Make X or Y randomly negative for robot distribution
    randomNegX = Math.floor(Math.random() * 2);
    randomNegZ = Math.floor(Math.random() * 2);

    if(randomNegX == 0) {randomNegX = -1;}
    if(randomNegZ == 0) {randomNegZ = -1;}

    //Distribute robots
    var topOrSide = Math.floor(Math.random() * 2);

    //If the robot generates above or below the FOV
    if(topOrSide == 0) {
      var randomX = (Math.floor(Math.random() * 400) - 200) * randomNegX;   //Random length-wise
      var randomZ = 100 * randomNegX;   //The multiplication makes it either appear above or below
    } else {
      //If the robot generates to the left or right of the FOV
      var randomX = 200 * randomNegX;
      var randomZ = (Math.floor(Math.random() * 200) - 100) * randomNegZ;   //Random height-wise
    }
    tmp.position.x = randomX;
    tmp.position.z = randomZ;
    tmp.position.y = -4;

    tmp.moveDistanceX = randomX / moveDistance;
    tmp.moveDistanceZ = randomZ / moveDistance;

    tmp.dead = 0;

    //Make them point towards the centre
    tmp.rotation.y = Math.atan(tmp.position.x / tmp.position.z) + (Math.PI);

    var roboMixer = new THREE.AnimationMixer(tmp);
    roboMixer.clipAction(robotAnimations[1]).play();

    robotMixers.push(roboMixer);
    tmp.name = "Robot" + i;

    robots.push(tmp);
    scene.add(tmp);
  }
}

function animate() {
    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    /*if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat * 0.001);
    }*/

    //Spin dice
    dice.rotation.x += .01;
    dice.rotation.y += .01;


    //Roboanimations
    for(var i = 0; i < robotMixers.length; i++) {
      robotMixers[i].update(deltat * 0.001);
    }

    //Move robots closer to target
    for(var i = 0; i < robots.length; i++) {
      //console.log(robots[i]);
      if(robots[i].dead == 1)
      {
          KF.update();
      } else {
        robots[i].position.x -= robots[i].moveDistanceX;
        robots[i].position.z -= robots[i].moveDistanceZ;
        //Reset if it reaches the goal
        if((robots[i].position.x <= 5 && robots[i].position.x >= -5) && (robots[i].position.z <= 5 && robots[i].position.z >= -5)) {
          //Lower score
          if(health > 0) {
            score--;
          }
          $('#score').text(score);
          $('#health').text(health);
          if(health <= 0) {
            $('#scoreFinal').text("Score: " + score);
            $("#gameover").show();
          }

          //Reset some crap
          //Make X or Y randomly negative for robot distribution
          randomNegX = Math.floor(Math.random() * 2);
          randomNegZ = Math.floor(Math.random() * 2);
          if(randomNegX == 0) {randomNegX = -1;}
          if(randomNegZ == 0) {randomNegZ = -1;}
          //Distribute robots
          var topOrSide = Math.floor(Math.random() * 2);
          //If the robot generates above or below the FOV
          if(topOrSide == 0) {
            var randomX = (Math.floor(Math.random() * 400) - 200) * randomNegX;   //Random length-wise
            var randomZ = 100 * randomNegX;   //The multiplication makes it either appear above or below
          } else {
            //If the robot generates to the left or right of the FOV
            var randomX = 200 * randomNegX;
            var randomZ = (Math.floor(Math.random() * 200) - 100) * randomNegZ;   //Random height-wise
          }
          robots[i].position.x = randomX;
          robots[i].position.z = randomZ;
          robots[i].moveDistanceX = randomX / moveDistance;
          robots[i].moveDistanceZ = randomZ / moveDistance;
          robots[i].rotation.y = Math.atan(robots[i].position.x / robots[i].position.z) + (Math.PI);
        }
      }
    }


}

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        if(game) {

          animate();
        }
}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/communism.jpg";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {
    $('#health').text(health);
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    //Raise camera, point downwards
    //Change back to 50 later
    camera = new THREE.PerspectiveCamera( 50, canvas.width / canvas.height, 1, 400 );
    camera.position.set(0, 200, 0);
    camera.rotation.x = -Math.PI/2;
    scene.add(camera);


    // Create a group to hold all the objects
    root = new THREE.Object3D;

    ambientLight = new THREE.AmbientLight ( 0xffffff );
    root.add(ambientLight);

    // Create the objects
    loadFBX();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(10, 4);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(1000, 400, 50, 50);   //Limits are roughly 400, 180
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;


    //Click detection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    document.addEventListener('mousedown', onDocumentMouseDown);

    // Now add the group to our scene
    scene.add( root );
    setInterval(function() {
      health--;
      $("#health").text(health);
    }, 1000);

}

//When clicking a robot
function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //Find intersections
    raycaster.setFromCamera( mouse, camera );

    //Not sure why I needed to specify "true"
    var intersects = raycaster.intersectObjects( scene.children, true );
    if ( intersects.length > 0 )
    {
        clicked = intersects[ 0 ].object;

        var clickedRobot = robots.filter(obj => {
          return obj.name === clicked.parent.name
        });
        var clickedRobotIndex = robots.findIndex(x => x.name === clicked.parent.name);

        //Adjust score
        if(clickedRobotIndex != -1) {
          score++;
          $('#score').text(score);
        }

        //robotMixers[clickedRobotIndex].clipAction(robotAnimations[2]).play();
        robotMixers[clickedRobotIndex].clipAction(robotAnimations[1]).stop();

        //Stop robot movement
        clickedRobot[0].moveDistanceX = 0;
        clickedRobot[0].moveDistanceZ = 0;
        clickedRobot[0].dead = 1;

        crateAnimator = new KF.KeyFrameAnimator;
        crateAnimator.init({
            interps:
                [

                    {
                        keys:[0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
                        values:[
                                { z : Math.PI / 10 },
                                { z : Math.PI / 8 },
                                { z : Math.PI / 6 },
                                { z : Math.PI / 4 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                { z : Math.PI / 2 },
                                ],
                        target:clickedRobot[0].rotation
                    },
                ],
            loop: 0,
            duration: animationDuration,
        });
        crateAnimator.start();
        if(!crateAnimator.running) {
          crateAnimator.interps[0].target = clickedRobot[0].rotation;

        }
        //playAnimations();

        //Wait until the animation finishes
        setTimeout(function(){
          crateAnimator.interps[0].target = null;
          robotMixers[clickedRobotIndex].clipAction(robotAnimations[1]).play();
          //Reset some crap
          //Make X or Y randomly negative for robot distribution
          randomNegX = Math.floor(Math.random() * 2);
          randomNegZ = Math.floor(Math.random() * 2);
          if(randomNegX == 0) {randomNegX = -1;}
          if(randomNegZ == 0) {randomNegZ = -1;}
          //Distribute robots
          var topOrSide = Math.floor(Math.random() * 2);
          //If the robot generates above or below the FOV
          if(topOrSide == 0) {
            var randomX = (Math.floor(Math.random() * 400) - 200) * randomNegX;   //Random length-wise
            var randomZ = 100 * randomNegX;   //The multiplication makes it either appear above or below
          } else {
            //If the robot generates to the left or right of the FOV
            var randomX = 200 * randomNegX;
            var randomZ = (Math.floor(Math.random() * 200) - 100) * randomNegZ;   //Random height-wise
          }
          clickedRobot[0].position.x = randomX;
          clickedRobot[0].position.z = randomZ;
          clickedRobot[0].dead = 0;
          clickedRobot[0].moveDistanceX = randomX / moveDistance;
          clickedRobot[0].moveDistanceZ = randomZ / moveDistance;
          clickedRobot[0].rotation.y = Math.atan(clickedRobot[0].position.x / clickedRobot[0].position.z) + (Math.PI);
          clickedRobot[0].rotation.z = 0;
        }, animationDuration + 100);

    }
}

function loadDice() {
  //Load texture
  var eyeTexture = new THREE.TextureLoader().load("../images/dice.png");
  var eyeMaterial = new THREE.MeshPhongMaterial({map: eyeTexture});

  var loader = new THREE.OBJLoader();
  // load a resource/
  loader.load(
    // resource URL
    '../models/dice.obj',
    // called when resource is loaded

    function ( object ) {

      //Apply texture, thanks https://blender.stackexchange.com/questions/64932/using-three-js-how-to-add-texture-to-obj-object
      object.traverse( function ( node ){
        if ( node.isMesh ) node.material = eyeMaterial;
      });

      var dieDim = 1500;
      object.scale.set(dieDim, dieDim, dieDim);

      dice = object;
      scene.add( dice );
    },
    // called when loading is in progresses
    function ( xhr ) {
    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened' );
    }
  );
}
