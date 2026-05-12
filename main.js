import Go from './go.js';
import Process from './process.js';
import { canvas, view } from './canvas.js';
import Util from './util.js';
import { vertex, fragment } from './shaders.js';
import { mat4, vec3, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Shape from './shape.js';
import Nav from './nav.js';

const size = 100; // plane size                                     
const divisions = 100; // number of subdivisions (higher = more vertices)
const vertices = Util.getPlaneVertices(size, divisions);
const indices = Util.getPlaneIndices(divisions);

const planeVertices = Util.createBuffer(view, vertices, view.ARRAY_BUFFER);
const planeIndicies = Util.createBuffer(view, indices, view.ELEMENT_ARRAY_BUFFER);

const shader = Util.createShader(view, vertex, fragment);
const vertexPosition = view.getAttribLocation(shader, 'vertexPosition');
const vertexColor = view.getAttribLocation(shader, 'vertexColor');
const matWorld = view.getUniformLocation(shader, 'matWorld');
const matViewProj = view.getUniformLocation(shader, 'matViewProj');

const planeVao = Util.getVao(view, planeVertices, planeIndicies, vertexPosition, vertexColor);

const UP_VECTOR = vec3.fromValues(0, 1, 0);
const RIGHT_VECTOR = vec3.fromValues(1, 0, 0);
const FORWARD_VECTOR = vec3.fromValues(0, 0, -1);
const plain = new Shape(vec3.fromValues(0, 0, 0), 1, UP_VECTOR, 0, planeVao, indices.length);

const matView = mat4.create();
const matProj = mat4.create();
const matViewPr = mat4.create();
let cameraAngle = 0;

const X = 0, Y = 1, Z = 2;
let cameraX = 0;
let cameraY = 3;
let cameraZ = 10;
let cameraHeading = 0;
let cameraPitch = 0;
let heading = 0;
let elevation = 0;
let cameraPos = [cameraX, cameraY, cameraZ];
//const lookAt = [0, 0, -1];
const FORWARD = [0, 0, -1];
const forward = [0, 0, -1];
const RIGHT = [1, 0, 0];
const right = [1, 0, 0];
const UP = [0, 1, 0];

const rightVec = [1, 0, 0];
//const elevatedLookAt = [0, 0, -1];

const fov = Util.toRadians(90);

view.clearColor(0.02, 0.02, 0.02, 1.0);
view.clear(view.COLOR_BUFFER_BIT | view.DEPTH_BUFFER_BIT);
view.enable(view.DEPTH_TEST);
view.enable(view.CULL_FACE);
view.viewport(0, 0, canvas.width, canvas.height);
view.useProgram(shader);


//Process.SetFrameLimit(84);
function animate(ts) {
    Process.Frame(ts);
    view.clear(view.COLOR_BUFFER_BIT | view.DEPTH_BUFFER_BIT);

    let turnSpeed = Math.PI / 2 * Process.DT; // 0.002;
    let factor = 1;
    if (Go.Shift) factor = 5;
    if (Go.Ctrl) factor = 0.5;
    turnSpeed *= factor;
    if (Go.Forward) Util.addVectorsInPlace(cameraPos, Util.scaleVector(Nav.Direction, Process.DT * factor * 5));
    if (Go.TurnLeft) Nav.Azimuth -= turnSpeed;
    if (Go.TurnRight) Nav.Azimuth += turnSpeed;
    if (Go.TiltUp) Nav.Elevation += turnSpeed;
    if (Go.TiltDown) Nav.Elevation -= turnSpeed;

    const lookAt = Util.addVectors(cameraPos, Nav.Direction);
    mat4.lookAt(matView,
        //vec3.fromValues(...cameraPos), // camera position
        cameraPos,
        //vec3.fromValues(...Util.addVectors(cameraPos, Nav.Lookat)), // look at point
        lookAt,
        //vec3.fromValues(...UP)); // up vector
        UP);

    // matProj = perspective(fov, aspect, near, far)
    mat4.perspective(matProj, fov, canvas.aspect, 0.1, 100);

    // matViewPr = matProj * matView
    mat4.multiply(matViewPr, matProj, matView);

    view.uniformMatrix4fv(matViewProj, false, matViewPr);

    plain.draw(matWorld);


    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
