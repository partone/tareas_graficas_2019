/*
Eric Parton
A01023503
*/

var renderer = null,
scene = null,
camera = null,
root = null,
ring = null,
penguin = null,
group = null,
orbitControls = null;
crateAnimator = null;
animatePenguin = true;
loopAnimation = true;

var objLoader = null, jsonLoader = null;

var currentTime = Date.now();

function loadObj()
{
    if(!objLoader)
        objLoader = new THREE.OBJLoader();

    objLoader.load(
        'Penguin_obj/penguin.obj',

        function(object)
        {
            var texture = new THREE.TextureLoader().load('Penguin_obj/peng_texture.jpg');
            /*var normalMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_N.jpg');
            var specularMap = new THREE.TextureLoader().load('../models/cerberus/Cerberus_M.jpg');*/

            object.traverse( function ( child )
            {
                if ( child instanceof THREE.Mesh )
                {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.map = texture;
                    /*child.material.normalMap = normalMap;
                    child.material.specularMap = specularMap;*/
                }
            } );

            penguin  = object;
            penguin.scale.set(1, .5,1);   //Give the penguin bigger bones
            penguin.position.y = -4;
            scene.add(object);
        },
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        });
}

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        // Update the camera controller
        orbitControls.update();
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var pointLight = null;
var mapUrl = "../images/cashew.jpg";    //Yummy yummy

var SHADOW_MAP_WIDTH = 3048, SHADOW_MAP_HEIGHT = 3048;

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-100, 160, 120);
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    //Cool spotlight to make the penguin feel special
    spotLight = new THREE.SpotLight (0xffffff, 1.5, 350);
    spotLight.position.set(0, 45, 0);         //Position in the sky
    spotLight.target.position.set(0, 0, 0);   //Point towards the ground
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow. camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    //Standar ambient light
    ambientLight = new THREE.AmbientLight ( 0xffffff, .8);
    root.add(ambientLight);

    // Create a group to hold the objects
    group = new THREE.Object3D;


    // Create the objects
    loadObj();


    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );
}

//Play playAnimations
function playAnimations()
{
    // position animation
    if (crateAnimator)
        crateAnimator.stop();

    penguin.position.set(0, -4, 0);
    penguin.rotation.set(0, 0, 0);

    if (animatePenguin)
    {
        crateAnimator = new KF.KeyFrameAnimator;
        crateAnimator.init({
            interps:
                [
                  //Figure 8 movement
                  {
                      keys:[0/36, 1/36, 2/36, 3/36, 4/36, 5/36,
                        6/36, 7/36, 8/36, 9/36, 10/36,
                        11/36, 12/36, 13/36, 14/36, 15/36,
                        16/36, 17/36, 18/36, 19/36, 20/36,
                        21/36, 22/36, 23/36, 24/36, 25/36,
                        26/36, 27/36, 28/36, 29/36, 30/36,
                        31/36, 32/36, 33/36, 34/36, 35/36, 36/36,
                      ],
                      values:[
                              { x : 0,      z:0,        y: -4 },  //1
                              { x : 2*4,    z:2*4,      y: -4 },
                              { x : 2*8,    z:2*7,      y: -4 },
                              { x : 2*12,   z:2*9,      y: -4 },
                              { x : 2*16,   z:2*10,     y: -4 },  //5
                              { x : 2*20,   z:2*9.6,    y: -4 },
                              { x : 2*22.5, z:2*8.25,   y: -4 },
                              { x : 2*25,   z:2*7,      y: -4 },
                              { x : 2*27,   z:2*4.8,    y: -4 },
                              { x : 2*28.5, z:0,        y: -4 },  //10, apex
                              { x : 2*27,   z:2*-4.8,   y: -4 },
                              { x : 2*25,   z:2*-7,     y: -4 },
                              { x : 2*22.5, z:2*-8.25,  y: -4 },
                              { x : 2*20,   z:2*-9.6,   y: -4 },
                              { x : 2*16,   z:2*-10,    y: -4 },  //15
                              { x : 2*12,   z:2*-9,     y: -4 },
                              { x : 2*8,    z:2*-7,     y: -4 },
                              { x : 2*4,    z:2*-4,     y: -4 },
                              { x : 0,      z:0,        y: -4 },  //At middle again
                              { x : 2*-4,   z:2*4,      y: -4 },  //20
                              { x : 2*-8,   z:2*7,      y: -4 },
                              { x : 2*-12,  z:2*9,      y: -4 },
                              { x : 2*-16,  z:2*10,     y: -4 },
                              { x : 2*-20,  z:2*9.6,    y: -4 },
                              { x : 2*-22.5,z:2*8.25,   y: -4 },  //25
                              { x : 2*-25,  z:2*7,      y: -4 },
                              { x : 2*-27,  z:2*4.8,    y: -4 },
                              { x : 2*-28.5,z:0,        y: -4 },  //apex
                              { x : 2*-27,  z:2*-4.8,   y: -4 },
                              { x : 2*-25,  z:2*-7,     y: -4 },  //30
                              { x : 2*-22.5,z:2*-8.25,  y: -4 },
                              { x : 2*-20,  z:2*-9.6,   y: -4 },
                              { x : 2*-16,  z:2*-10,    y: -4 },
                              { x : 2*-12,  z:2*-9,     y: -4 },
                              { x : 2*-8,   z:2*-7,     y: -4 },  //35
                              { x : 2*-4,   z:2*-4,     y: -4 },
                              { x : 0,      z:0,        y: -4 },  //37, back at middle
                              ],
                      target:penguin.position
                  },
                  //Left/right gait
                    {     //Mid   left  mid   right
                      keys:[0/72, 1/72, 2/72, 3/72,
                            4/72, 5/72, 6/72, 7/72,
                            8/72, 9/72, 10/72,11/72,
                            12/72, 13/72, 14/72, 15/72,
                            16/72, 17/72, 18/72, 19/72,
                            20/72, 21/72, 22/72, 23/72,
                            24/72, 25/72, 26/72, 27/72,
                            28/72, 29/72, 30/72, 31/72,
                            32/72, 33/72, 34/72, 35/72,
                            36/72, 37/72, 38/72, 39/72,
                            40/72, 41/72, 42/72, 43/72,
                            44/72, 45/72, 46/72, 47/72,
                            48/72, 49/72, 50/72, 51/72,
                            52/72, 53/72, 54/72, 55/72,
                            56/72, 57/72, 58/72, 59/72,
                            60/72, 61/72, 62/72, 63/72,
                            64/72, 65/72, 66/72, 67/72,
                            68/72, 69/72, 70/72, 71/72, 72/72,
                      ],
                        values:[
                              //Middle    Left       Middle    Right
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                { z : 0}, { z : -.1}, { z : 0}, { z : .1},
                                {z : 0},
                                ],
                        target:penguin.rotation
                    },
                    //Left/right gait
                      {     //Mid   left  mid   right
                        keys:[0/36, 1/36, 2/36, 3/36, 4/36, 5/36,
                          6/36, 7/36, 8/36, 9/36, 10/36,
                          11/36, 12/36, 13/36, 14/36, 15/36,
                          16/36, 17/36, 18/36, 19/36, 20/36,
                          21/36, 22/36, 23/36, 24/36, 25/36,
                          26/36, 27/36, 28/36, 29/36, 30/36,
                          31/36, 32/36, 33/36, 34/36, 35/36, 36/36,
                        ],
                          values:[
                                  { y : Math.PI/4},   //1
                                  { y : Math.PI/4},
                                  { y : Math.PI/3.5},
                                  { y : Math.PI/2.7},
                                  { y : Math.PI/2},   //5
                                  { y : Math.PI/1.7},
                                  { y : Math.PI/1.5},
                                  { y : Math.PI/1.5},
                                  { y : Math.PI/1.2},
                                  { y : Math.PI},      //10, peak
                                  { y : 7*Math.PI/6},
                                  { y : 5*Math.PI/4},
                                  { y : 4*Math.PI/3},
                                  { y : 3*Math.PI/2},
                                  { y : 3*Math.PI/2},   //15
                                  { y : 5*Math.PI/3},
                                  { y : 6*Math.PI/3.5},
                                  { y : 7*Math.PI/4},   //At the middle again
                                  { y : -Math.PI/4 + (2*Math.PI)},
                                  { y : -Math.PI/4 + (2*Math.PI)},
                                  { y : -Math.PI/3.5 + (2*Math.PI)},
                                  { y : -Math.PI/2.7 + (2*Math.PI)},
                                  { y : -Math.PI/2 + (2*Math.PI)},
                                  { y : -Math.PI/1.7 + (2*Math.PI)},
                                  { y : -Math.PI/1.5 + (2*Math.PI)},
                                  { y : -Math.PI/1.5 + (2*Math.PI)},
                                  { y : -Math.PI/1.2 + (2*Math.PI)},
                                  { y : -Math.PI + (2*Math.PI)},      //Peak again
                                  { y : -7*Math.PI/6 + (2*Math.PI)},
                                  { y : -5*Math.PI/4 + (2*Math.PI)},
                                  { y : -4*Math.PI/3 + (2*Math.PI)},
                                  { y : -3*Math.PI/2 + (2*Math.PI)},
                                  { y : -3*Math.PI/2 + (2*Math.PI)},
                                  { y : -5*Math.PI/3 + (2*Math.PI)},
                                  { y : -6*Math.PI/3.5 + (2*Math.PI)},
                                  { y : -7*Math.PI/4 + (2*Math.PI)},
                                  { y : Math.PI/4},
                                  ],
                          target:penguin.rotation
                      },
                ],
            loop: loopAnimation,
            duration:10001,   //10 second duration
            //easing:TWEEN.Easing.Bounce.InOut,

        });
        crateAnimator.start();
    }
}
