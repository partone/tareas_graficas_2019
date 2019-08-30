mat4 = glMatrix.mat4;

var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
    mat4.translate(projectionMatrix, projectionMatrix, [0, 0, -10]);
}

function createPyramid(gl, translation, rotationAxis){
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var verts = [
      //Sides
     -1.0, 0.0,  0.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
     -1.0,  0.0,  0.0,

     -1.0, 0.0, 0.0,
     -1.0,  0.0, 0.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

     -1.0,  0.0, 0.0,
     -1.0,  0.0,  0.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,

     -1.0, 0.0, 0.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
     -1.0, 0.0,  0.0,

     //Bottom ( ͡° ͜ʖ ͡°)
      1.0, -1.0, -1.0,
      1.0,  1.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [1.0, 0.0, 0.0, 1.0], // Front face
      [0.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 0.0, 1.0, 1.0], // Top face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
      [1.0, 0.0, 1.0, 1.0], // Right face
      [0.0, 1.0, 1.0, 1.0]  // Left face
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  for (const color of faceColors)
  {
      for (var j=0; j < 4; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var pyramidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
  var pyramidIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

  var pyramid = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
          vertSize:3, nVerts:20, colorSize:4, nColors: 20, nIndices:30,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);
  var i = 0;
  pyramid.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);


      //When i is less than 30, it goes down.  Otherwise it goes up.  At 59 it resets
      if(i < 30){
        mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, [0, -.1, 0]);
      } else {
        mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, [0, .1, 0]);
      }
      i++;
      if (i > 59) {
        i = 0;
      }

  };

  return pyramid;
}

function createOctahedron(gl, translation, rotationAxis){
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var verts = [
      //Top sides
     -1.0, 0.0,  0.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
     -1.0,  0.0,  0.0,

     -1.0, 0.0, 0.0,
     -1.0,  0.0, 0.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

     -1.0,  0.0, 0.0,
     -1.0,  0.0,  0.0,
      1.0,  1.0,  1.0,
      1.0,  1.0, -1.0,

     -1.0, 0.0, 0.0,
      1.0, -1.0, -1.0,
      1.0, -1.0,  1.0,
     -1.0, 0.0,  0.0,

     //Bottom sides
     3.0, 0.0,  0.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
     3.0,  0.0,  0.0,

     3.0, 0.0, 0.0,
     3.0,  0.0, 0.0,
      1.0,  1.0, -1.0,
      1.0, -1.0, -1.0,

      3.0,  0.0, 0.0,
      3.0,  0.0,  0.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      3.0, 0.0, 0.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
       3.0, 0.0,  0.0,
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [1.0, 0.0, 0.0, 1.0], // Front face
      [0.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 0.0, 1.0, 1.0], // Top face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
      [1.0, 0.0, 1.0, 1.0], // Right face
      [0.0, 1.0, 1.0, 1.0], // Left face
      [0.5, 0.5, 0.25, 1.0],// Left face
      [0.9, 0.3, 0.1, 1.0]  // Left face
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  for (const color of faceColors)
  {
      for (var j=0; j < 4; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var octahedronIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
  var octahedronIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23,  // Left face
      24, 25, 26,   24, 26, 27,  // Left face
      28, 29, 30,   28, 30, 31  // Left face
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

  var octahedron = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
          vertSize:3, nVerts:32, colorSize:4, nColors: 32, nIndices:48,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);
  var i = 0
  var limit = 145;
  octahedron.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      //When i is less than 30, it goes down.  Otherwise it goes up.  At 59 it resets
      if(i < limit){
        mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0, -.05, 0]);
      } else {
        mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0, .05, 0]);
      }
      i++;
      if (i > limit*2-1) {
        i = 0;
      }

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return octahedron;
}

function createPentPyramid(gl, translation, rotationAxis){
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var verts = [
     //Bottom ( ͡° ͜ʖ ͡°)
      1.0, -2.0, -1.0,
      1.0,  2.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0, 0,  -2,

      //Sides
      -2.0, 0.0,  0.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      1.0,  1.0,  1.0,

      -2.0, 0.0, 0.0,
      -1.0,  0.0, 0.0,
       1.0,  0, -2.0,
       1.0, -2.0, -1.0,

      -2.0,  0.0, 0.0,
      -1.0,  0.0,  0.0,
       1.0,  1.0,  1.0,
       1.0,  2.0, -1.0,

      -2.0, 0.0, 0.0,
       1.0, -2.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, 0.0,  0.0,

      -2.0, 0.0, 0.0,
      -1.0,  0.0, 0.0,
       1.0,  0, -2.0,
       1.0, 2.0, -1.0,
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [0.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 1.0, 1.0, 1.0], // Back face
      [0.0, 0.0, 1.0, 1.0], // Top face
      [1.0, 0.0, 0.0, 1.0], // Bottom face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  //Pentagon face
  for (var j=0; j < 5; j++)
    vertexColors = vertexColors.concat([1.0, 0.0, 0.0, 1.0]);
  for (const color of faceColors)
  {
      for (var j=0; j < 4; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var pyramidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
  var pyramidIndices = [
      0, 1, 2,      0, 1, 3,    // Front face
      0, 1, 4,      2, 0, 3,    // Back face
      5, 6, 8,      5, 6, 9,    // Front face
      9, 10, 11,      9, 11, 12,    // Back face
      13, 14, 15,     13, 15, 16,  // Top face
      17, 18, 19,   17, 19, 20, // Bottom face
      21, 22, 23,   21, 23, 24, // Right face
      25, 26, 27,   25, 27, 28, // Right face
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

  var pyramid = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
          vertSize:3, nVerts:26, colorSize:4, nColors: 42, nIndices:48,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

  pyramid.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return pyramid;
}

function createScutoid(gl, translation, rotationAxis){
  // Vertex Data
  var vertexBuffer;
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  var verts = [
     //Bottom ( ͡° ͜ʖ ͡°)  Pentagon
      1.0, -2.0, -1.0,    //0
      1.0,  2.0, -1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0, 0,  -2,

      //Top Hexagon
      5.0, -2.0, -0.5,    //5
      5.0,  2.0, -0.5,
      5.0,  1.0,  1.0,
      5.0, -1.0,  1.0,
      5.0,  -1,  -2,      //9
      5.0, 1,  -2,        //10

      //My sides xD
      //Corner piece
      5.0, -2.0, -0.5,    //11
      5.0, -1, -2,        //12
      4.0, -2.0, -1,      //13
      4.0, -2.0, -1,      //14

      //Normal faces
      5.0,  1.0,  1.0,
      5.0, -1.0,  1.0,
      1.0,  1.0,  1.0,
      1.0, -1.0,  1.0,    //18

      1.0,  2.0, -1.0,
      1.0,  1.0,  1.0,
      5.0,  2.0, -0.5,
      5.0,  1.0,  1.0,    //22

      1.0, -2.0, -1.0,
      1.0, -1.0,  1.0,
      5.0, -2.0, -0.5,
      5.0, -1.0,  1.0,    //26

      1.0,  2.0, -1.0,
      1.0, 0.0,  -2.0,
      5.0,  2.0, -0.5,
      5.0, 1.0,  -2.0, //30

      4.0, -2.0, -1,
      1.0, -2.0, -1.0,
      1.0, 0,  -2,
      5.0,  -1,  -2,  //34

      5.0,  -1,  -2,
      5.0, 1,  -2,
      1.0, 0,  -2,
      1.0, 0,  -2,    //38
     ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  // Color data
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  var faceColors = [
      [0.0, 1.0, 0.0, 1.0], // Back face
      [0.0, 1.0, 1.0, 1.0], // Back face
      [0.0, 0.0, 1.0, 1.0], // Top face
      [1.0, 0.0, 0.0, 1.0], // Bottom face
      [1.0, 1.0, 0.0, 1.0], // Bottom face
  ];

  // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
  var vertexColors = [];
  // for (var i in faceColors)
  // {
  //     var color = faceColors[i];
  //     for (var j=0; j < 4; j++)
  //         vertexColors = vertexColors.concat(color);
  // }
  //Pentagon face
  for (var j=0; j < 5; j++)
    vertexColors = vertexColors.concat([1.0, 0.3, 0.6, 1.0]);

  //Hexagon face
    for (var j=0; j < 6; j++)
      vertexColors = vertexColors.concat([1.0, 1.0, 0.4, 1.0]);


  for (const color of faceColors)
  {
      for (var j=0; j < 4; j++)
          vertexColors = vertexColors.concat(color);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

  // Index data (defines the triangles to be drawn).
  var scutoidIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, scutoidIndexBuffer);
  var scutoidIndices = [
    //Pentagon
      0, 1, 2,      0, 1, 3,    // Front face
      0, 1, 4,      2, 0, 3,    // Back face

      //Hexagon
      7, 6, 10,     8, 5, 9,
      8, 7, 9,      7, 9, 10,

      //Faces
      15, 16, 17,      16, 17, 18,

      //Small triangle
      12, 13, 11,

      //Sides
      19, 20, 22,    21, 22, 19,
      23, 24, 25,   25, 26, 24,
      27, 28, 29,   29, 30, 28,
      31, 32, 33,   34, 33, 31,
      35, 36, 37
  ];

  // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
  // Uint16Array: Array of 16-bit unsigned integers.
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(scutoidIndices), gl.STATIC_DRAW);

  var scutoid = {
          buffer:vertexBuffer, colorBuffer:colorBuffer, indices:scutoidIndexBuffer,
          vertSize:3, nVerts:26, colorSize:4, nColors: 42, nIndices:60,
          primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

  mat4.translate(scutoid.modelViewMatrix, scutoid.modelViewMatrix, translation);

  scutoid.update = function()
  {
      var now = Date.now();
      var deltat = now - this.currentTime;
      this.currentTime = now;
      var fract = deltat / duration;
      var angle = Math.PI * 2 * fract;

      // Rotates a mat4 by the given angle
      // mat4 out the receiving matrix
      // mat4 a the matrix to rotate
      // Number rad the angle to rotate the matrix by
      // vec3 axis the axis to rotate around
      mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
  };

  return scutoid;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs)
{
  // clear the background (with black)
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

  // set the shader to use
  gl.useProgram(shaderProgram);

  for(i = 0; i<objs.length; i++)
  {
      obj = objs[i];
      // connect up the shader parameters: vertex position, color and projection/model matrices
      // set up the buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
      gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
      gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

      gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
      gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

      // Draw the object's primitives using indexed buffer information.
      // void gl.drawElements(mode, count, type, offset);
      // mode: A GLenum specifying the type primitive to render.
      // count: A GLsizei specifying the number of elements to be rendered.
      // type: A GLenum specifying the type of the values in the element array buffer.
      // offset: A GLintptr specifying an offset in the element array buffer.
      gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
  }
}

function run(gl, objs)
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
