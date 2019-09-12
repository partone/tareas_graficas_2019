// Bump maps.
// A bump map is a bitmap used to displace the surface normal vectors of a mesh to create an apparently bumpy surface. The pixel values of the bitmap are treated as heights rather than color values. For example, a pixel value of zero can mean no displacement from the surface, and nonzero values can mean positive displacement away from the surface. Typically, single-channel black and white bitmaps are used.

var renderer = null,
scene = null,
camera = null,
controls = null,
root = null,
group = null,
sphere = null,
sphereTextured = null;
asteroidsGroup = null;

//Space object global declaration
var spaceObjects = [];
var asteroid;

var duration = 10000; // ms
var currentTime = Date.now();

var materials = {};

//Generic space object
class spaceObject {
  //The material can generally be used to figure out which object is being referred to
  constructor(radius, widthSeg, heightSeg, material, initX, initY, initZ, axisRotation, speed, counter) {
    this.initX = initX;   //For rotation
    this.geometry = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
    this.sphere = new THREE.Mesh(this.geometry, materials[material]);
    this.sphere.translateX(initX);
    this.sphere.translateY(initY);
    this.sphere.translateZ(initZ);
    this.axisRotation = axisRotation;   //0.1 is the Earth's speed
    this.speed = speed;   //Orbital speed but it's proportional to the time taken to orbit
    this.counter = counter;   //For countering the rotation direction, either 0 or 1 - 0 is anti-clockwise

    //Torus that can be used optionally, only works on a single axis
    var geometryT = new THREE.TorusGeometry(initX, 0.005, 16, 100 );
    var materialT = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    this.torus = new THREE.Mesh( geometryT, materialT );
    this.torus.rotateX(Math.PI/2);

  }
}

var orbitCounter = 0;   //For calculating cos and sin of something orbiting
function animate()
{

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;
    var fract = deltat / duration;
    var angle = Math.PI * 2 * fract;

    var time = Date.now() * 0.0005;
    //So for the rotation around the sun (or other objects), the formula is
    //x = (Math.cos([speed] * j / 360 * 2 * Math.PI) * [The distance from x = 0])
    //Then the same thing for z

    //Recalculate the position of the objects based on their orbit

    for (var i = 0; i < spaceObjects.length; i++) {
      spaceObjects[i].sphere.position.x = (Math.cos( spaceObjects[i].speed*orbitCounter/360*2*Math.PI)*spaceObjects[i].initX);
      spaceObjects[i].sphere.position.z = (Math.sin( spaceObjects[i].speed*orbitCounter/360*2*Math.PI)*spaceObjects[i].initX);
    }
    orbitCounter++;

    //Set everything spinning on its axis
    for (var i = 0; i < spaceObjects.length; i++) {
      spaceObjects[i].geometry.rotateY(spaceObjects[i].axisRotation * (1 + (-2 * spaceObjects[i].counter)));
    }

    //Asteroid rotation
    asteroidsGroup.rotateY(-.01);
}

function run()
{
    requestAnimationFrame(function() { run(); });

    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();
}

function createMaterials()
{
  //A whole bunch of these from https://planet-texture-maps.fandom.com
  //Sun
  sunMap = new THREE.TextureLoader().load("../images/sunMap.jpg");
  materials["sun"] = new THREE.MeshBasicMaterial({ map: sunMap});

  //Mercury
  mercuryMap = new THREE.TextureLoader().load("../images/mercurymap.jpg");
  mercuryBumpMap = new THREE.TextureLoader().load("../images/mercurybump.jpg");
  materials["mercury"] = new THREE.MeshPhongMaterial({ map: mercuryMap, bumpMap: mercuryBumpMap, bumpScale: 0.01});

  //Venus
  venusMap = new THREE.TextureLoader().load("../images/venusmap.jpg");
  venusBumpMap = new THREE.TextureLoader().load("../images/venusbump.jpg");
  materials["venus"] = new THREE.MeshPhongMaterial({ map: venusMap, bumpMap: venusBumpMap, bumpScale: 0.01});

  //Earth
  earthMap = new THREE.TextureLoader().load("../images/earthmap.jpg");
  earthNormal = new THREE.TextureLoader().load("../images/earthnormal.jpg");
  earthSpecular = new THREE.TextureLoader().load("../images/earthspecular.jpg")
  materials["earth"] = new THREE.MeshPhongMaterial({ map: earthMap, normalMap: earthNormal, specularMap: earthSpecular});

  //Mars
  marsMap = new THREE.TextureLoader().load("../images/marsmap.jpg");
  marsBumpMap = new THREE.TextureLoader().load("../images/marsbump.jpg");
  materials["mars"] = new THREE.MeshPhongMaterial({ map: marsMap, bumpMap: marsBumpMap, bumpScale: 0.01});

  //Jupiter
  jupiterMap = new THREE.TextureLoader().load("../images/jupitermap.jpg");
  materials["jupiter"] = new THREE.MeshPhongMaterial({ map: jupiterMap});

  //Saturn
  saturnMap = new THREE.TextureLoader().load("../images/saturnmap.jpg");
  materials["saturn"] = new THREE.MeshPhongMaterial({ map: saturnMap});

  //Uranus
  uranusMap = new THREE.TextureLoader().load("../images/uranusmap.jpg");
  materials["uranus"] = new THREE.MeshPhongMaterial({ map: uranusMap});

  //Neptune
  neptuneMap = new THREE.TextureLoader().load("../images/neptunemap.jpg");
  materials["neptune"] = new THREE.MeshPhongMaterial({ map: neptuneMap});

  //Pluto
  plutoMap = new THREE.TextureLoader().load("../images/plutomap.jpg");
  materials["pluto"] = new THREE.MeshPhongMaterial({ map: plutoMap});

  //Moons
  moonMap = new THREE.TextureLoader().load("../images/moonmap.jpg");
  moonBumpMap = new THREE.TextureLoader().load("../images/moonbump.jpg");
  materials["moon"] = new THREE.MeshPhongMaterial({ map: moonMap, bumpMap: moonBumpMap, bumpScale: 0.01});

  deimosMap = new THREE.TextureLoader().load("../images/deimosmap.jpg");
  deimosBumpMap = new THREE.TextureLoader().load("../images/deimosbump.jpg");
  materials["deimos"] = new THREE.MeshPhongMaterial({ map: deimosMap, bumpMap: deimosBumpMap, bumpScale: 0.01});

  phobosMap = new THREE.TextureLoader().load("../images/phobosmap.jpg");
  phobosBumpMap = new THREE.TextureLoader().load("../images/deimosmap.jpg");
  materials["phobos"] = new THREE.MeshPhongMaterial({ map: phobosMap, bumpMap: phobosBumpMap, bumpScale: 0.01});

  ganymedeMap = new THREE.TextureLoader().load("../images/ganymedemap.png");
  ganymedeBumpMap = new THREE.TextureLoader().load("../images/ganymedebump.jpg");
  materials["ganymede"] = new THREE.MeshPhongMaterial({ map: ganymedeMap, bumpMap: ganymedeBumpMap, bumpScale: 0.01});

  callistoMap = new THREE.TextureLoader().load("../images/callistomap.jpg");
  callistoNormalMap = new THREE.TextureLoader().load("../images/callistonormal.jpg");
  materials["callisto"] = new THREE.MeshPhongMaterial({ map: callistoMap, normalMap: callistoNormalMap});

  ioMap = new THREE.TextureLoader().load("../images/iomap.png");
  ioBumpMap = new THREE.TextureLoader().load("../images/iobump.png");
  materials["io"] = new THREE.MeshPhongMaterial({ map: ioMap, bumpMap: ioBumpMap, bumpScale: 0.01});

  europaMap = new THREE.TextureLoader().load("../images/europamap.jpg");
  europaBumpMap = new THREE.TextureLoader().load("../images/europabump.jpg");
  materials["europa"] = new THREE.MeshPhongMaterial({ map: europaMap, bumpMap: europaBumpMap, bumpScale: 0.01});

  titaniaMap = new THREE.TextureLoader().load("../images/titaniamap.png");
  materials["titania"] = new THREE.MeshPhongMaterial({ map: titaniaMap});

  oberonMap = new THREE.TextureLoader().load("../images/oberonmap.png");
  materials["oberon"] = new THREE.MeshPhongMaterial({ map: oberonMap});

  umbrielMap = new THREE.TextureLoader().load("../images/umbrielmap.png");
  materials["umbriel"] = new THREE.MeshPhongMaterial({ map: umbrielMap});

  arielMap = new THREE.TextureLoader().load("../images/arielmap.jpg");
  arielBumpMap = new THREE.TextureLoader().load("../images/arielbump.jpg");
  materials["ariel"] = new THREE.MeshPhongMaterial({ map: arielMap, bumpMap: arielBumpMap, bumpScale: 0.01});

  tritonMap = new THREE.TextureLoader().load("../images/tritonmap.jpg");
  materials["triton"] = new THREE.MeshPhongMaterial({ map: tritonMap });

  charonMap = new THREE.TextureLoader().load("../images/charonmap.png");
  materials["charon"] = new THREE.MeshPhongMaterial({ map: charonMap });
}

function setMaterialColor(r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    materials["phong"].color.setRGB(r, g, b);
    materials["phong-textured"].color.setRGB(r, g, b);
}

function setMaterialSpecular(r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    materials["phong"].specular.setRGB(r, g, b);
    materials["phong-textured"].specular.setRGB(r, g, b);
}

var materialName = "phong-textured";
var textureOn = true;

function setMaterial(name)
{
    materialName = name;
    if (textureOn)
    {
        sphere.visible = false;
        sphereTextured.visible = true;
        sphereTextured.material = materials[name];
    }
    else
    {
        sphere.visible = true;
        sphereTextured.visible = false;
        sphere.material = materials[name];
    }
}

function toggleTexture()
{
    textureOn = !textureOn;
    var names = materialName.split("-");
    if (!textureOn)
    {
        setMaterial(names[0]);
    }
    else
    {
        setMaterial(names[0] + "-textured");
    }
}

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color( 0, 0, 0 );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 400 );
    camera.position.z = 10;
    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.update();
    scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    //Sun light coming out from 0, 0, 0
    //Looks nicest with the distance at 18, good look spotting Pluto though lol
    var light = new THREE.PointLight( "rgb(255,255,255)", 2, 30);
    light.position.set(0, 0, 0);
    root.add( light );
    // Add a directional light to show off the object
    var light = new THREE.DirectionalLight( 0xffffff, 2);

    // Position the light out from the scene, pointing at the origin
    light.position.set(.5, 0, 1);
    root.add( light );

    // Create a group to hold the spheres
    group = new THREE.Object3D;
    root.add(group);

    // Create all the materials
    createMaterials();

    //constructor(radius, widthSeg, heightSeg, material, initX, initY, initZ, axisRotation, speed, counter) {

    //Add various space objects
    sun = new spaceObject (2, 20, 20, "sun", 0, 0, 0, 0, 0, 0);  //The sun is the centre of the solar system (?)
    //The sun is pretty big, bigger than 2 but you get the idea
    group.add(sun.sphere);

    //Mercury
    mercury = new spaceObject(.038, 20, 20, "mercury", 3, 0, 0, .00017, 4.15, 0);
    group.add(mercury.sphere);
    group.add(mercury.torus);

    //Venus
    venus = new spaceObject(.095, 20, 20, "venus", 4, 0, 0, .000086, 1.62, 1);
    group.add(venus.sphere);
    group.add(venus.torus);

    //Earth
    //Earth is .1 size, .01 rotation, and 1 speed, other planets are based on that
    earth = new spaceObject(.1, 20, 20, "earth", 5, 0, 0, .01, 1, 0);
    group.add(earth.sphere);
    group.add(earth.torus);

    //The moon's orbiting speed is 1.25, all other moons are based on that
    moon = new spaceObject(.02, 20, 20, "moon", .2, 0, 0, .01, 1.25, 0);
    earth.sphere.add(moon.sphere);

    //Mars
    mars = new spaceObject(.053, 20, 20, "mars", 6, 0, 0, .01, .53, 0);
    group.add(mars.sphere);
    group.add(mars.torus);

    phobos = new spaceObject(.009, 20, 20, "phobos", .12, 0, 0, .034, 101, 0);
    deimos = new spaceObject(.005, 20, 20, "deimos", .18, 0, 0, .008, 27, 0);
    mars.sphere.add(phobos.sphere);
    mars.sphere.add(deimos.sphere);


    //Gotta space these big boys out a bit more
    //Jupiter
    jupiter = new spaceObject(1.1, 20, 20, "jupiter", 10.5, 0, 0, .027, .084, 0);
    group.add(jupiter.sphere);
    group.add(jupiter.torus);

    ganymede = new spaceObject(.041, 20, 20, "ganymede", 1.75, 0, 0, .034, 4.75, 0);
    callisto = new spaceObject(.038, 20, 20, "callisto", 2, 0, 0, .008, 2.03, 0);
    io = new spaceObject(.028, 20, 20, "io", 1.25, 0, 0, .008, 28.67, 0);
    europa = new spaceObject(.024, 20, 20, "europa", 1.5, 0, 0, 9.51, 5.4, 0);
    jupiter.sphere.add(ganymede.sphere);
    jupiter.sphere.add(callisto.sphere);
    jupiter.sphere.add(io.sphere);
    jupiter.sphere.add(europa.sphere);

    //Saturn
    saturn = new spaceObject(.91, 20, 20, "saturn", 14.5, 0, 0, .024, .033, 0);
    group.add(saturn.sphere);
    group.add(saturn.torus);

    //Saturn's rings, hardcoding because Saturn is a special snowflake
    var geometryT = new THREE.TorusGeometry(1.5, 0.2, 2, 100 );
    saturnRingMap = new THREE.TextureLoader().load("../images/saturnringmap.png");
    saturnRingTransparencyMap = new THREE.TextureLoader().load("../images/saturnringtransparency.gif");
    var materialT = new THREE.MeshPhongMaterial({ map: saturnRingMap, alphaMap: saturnRingTransparencyMap});
    torus = new THREE.Mesh( geometryT, materialT );
    torus.rotateX(Math.PI/2);
    torus.rotateZ(10);
    saturn.sphere.add(torus);

    //Uranus
    uranus = new spaceObject(.39, 20, 20, "uranus", 17.5, 0, 0, .014, .012, 1);
    group.add(uranus.sphere);
    group.add(uranus.torus);

    titania = new spaceObject(.0091, 20, 20, "titania", .8, 0, 0, .034, 4.22, 0);
    oberon = new spaceObject(.0088, 20, 20, "oberon", .9, 0, 0, .008, 2.51, 0);
    umbriel = new spaceObject(.0067, 20, 20, "umbriel", .7, 0, 0, .008, 8.23, 0);
    ariel= new spaceObject(.0067, 20, 20, "ariel", .6, 0, 0, 9.51, 13.39, 0);
    uranus.sphere.add(titania.sphere);
    uranus.sphere.add(oberon.sphere);
    uranus.sphere.add(umbriel.sphere);
    uranus.sphere.add(ariel.sphere);

    //Neptune
    neptune = new spaceObject(.39, 20, 20, "neptune", 19.5, 0, 0, .015, .006, 0);
    group.add(neptune.sphere);
    group.add(neptune.torus);

    triton= new spaceObject(.016, 20, 20, "triton", .6, 0, 0, 9.51, 5.75, 1);
    neptune.sphere.add(triton.sphere);

    //Pluto
    pluto = new spaceObject(.019, 20, 20, "pluto", 20.5, 0, 0, 0.0016, .004, 0);
    group.add(pluto.sphere);
    group.add(pluto.torus);

    charon = new spaceObject(.0097, 20, 20, "charon", .1, 0, 0, 1, 5.63, 1);
    pluto.sphere.add(charon.sphere);

    //Asteroid belt


    var loader = new THREE.OBJLoader();
    // load a resource
    loader.load(
    	// resource URL
    	'../objects/asteroid.obj',
    	// called when resource is loaded
    	function ( object ) {
        asteroid = object;
        asteroid.scale.set(.01, .01, .01);

        asteroid.speed = .5;
        asteroid.initX = 7.5;
        asteroid.axisRotation = .05;

        var asteroidNumber = 90;
        var randomDistance;

        asteroidsGroup = new THREE.Object3D;
        //asteroids.push(asteroid.clone());
        asteroids2 = asteroid.clone();

        for(var i = 0; i < asteroidNumber; i++){
          asteroids2 = asteroid.clone();
          randomDistance = Math.random() + 7;
          asteroids2.speed = Math.random() / 2;
          asteroids2.axisRotation = .05;
          asteroids2.position.set(Math.sin( i/asteroidNumber*2*Math.PI)*randomDistance, .5-Math.random(), Math.cos( i/asteroidNumber*2*Math.PI)*randomDistance);
          //scene.add(asteroids2);
          asteroidsGroup.add(asteroids2);
        }

        scene.add(asteroidsGroup);
    	},
    	// called when loading is in progresses
    	function ( xhr ) {
    	},
    	// called when loading has errors
    	function ( error ) {
    		console.log( 'An error happened' );
    	}
    );

    //Any object not in this array won't spin
    spaceObjects = [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto, moon, deimos, phobos, ganymede, callisto, io, europa, titania, oberon, umbriel, ariel, triton, charon];

    // Now add the group to our scene
    scene.add( root );
}

function rotateScene(deltax)
{
    root.rotation.y += deltax / 100;
    $("#rotation").html("rotation: 0," + root.rotation.y.toFixed(2) + ",0");
}

function scaleScene(scale)
{
    root.scale.set(scale, scale, scale);
    $("#scale").html("scale: " + scale);
}

function modifyBump(scale)
{
    materials["phong"].bumpScale =  scale;
    materials["phong-textured"].bumpScale = scale;
}
