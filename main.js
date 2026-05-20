import Go from './go.js';
import Process from './process.js';
import { canvas, view } from './canvas.js';
import Util from './util.js';
import { vertex, fragment } from './shaders.js';
import { mat4, vec3, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Shape from './shape.js';
import { Camera } from './camera.js';
import { TriPyramid } from './tripyramid.js';

const shader = Util.createShader(view, vertex, fragment);
view.useProgram(shader);
const vertexPosition = view.getAttribLocation(shader, 'vertexPosition');
const vertexColor = view.getAttribLocation(shader, 'vertexColor');
const matWorld = view.getUniformLocation(shader, 'matWorld');
const matViewProj = view.getUniformLocation(shader, 'matViewProj');
const matView = mat4.create();
const matProj = mat4.create();
const matViewPr = mat4.create();

const size = 50; // plane size                                     
const divisions = 50; // number of subdivisions (higher = more vertices)
const vPlane = Util.getPlaneVertices(size, divisions);
const iPlane = Util.getPlaneIndices(divisions);
const vbPlane = Util.createBuffer(view, vPlane, view.ARRAY_BUFFER);
const ibPlane = Util.createBuffer(view, iPlane, view.ELEMENT_ARRAY_BUFFER);
const vaoPlane = Util.getVao(view, vbPlane, ibPlane, vertexPosition, vertexColor);
const plain = new Shape(vec3.fromValues(0, 0, 0), 1, [0, 1, 0], 0, vaoPlane, iPlane.length);


const vPyramid = Util.getPyramidVertices();
const iPyramid = Util.getPyramidIndices();
const vbPyramid = Util.createBuffer(view, vPyramid, view.ARRAY_BUFFER);
const ibPyramid = Util.createBuffer(view, iPyramid, view.ELEMENT_ARRAY_BUFFER);
const vaoPyramid = Util.getVao(view, vbPyramid, ibPyramid, vertexPosition, vertexColor);
const pyramid = new Shape([0, 5, -10], 1, [0, 1, 0], 1, vaoPyramid, iPyramid.length);

const triPyramid = new TriPyramid(shader, [-5, 5, -10], 1, 0, [0, 1, 0]);


const camera = new Camera();

view.clearColor(0.02, 0.02, 0.02, 1.0);
view.clear(view.COLOR_BUFFER_BIT | view.DEPTH_BUFFER_BIT);
view.enable(view.DEPTH_TEST);
view.enable(view.CULL_FACE);
view.viewport(0, 0, canvas.width, canvas.height);

function animate(ts) {
    Process.Frame(ts);
    view.clear(view.COLOR_BUFFER_BIT | view.DEPTH_BUFFER_BIT);
    Process.Input(camera);

    mat4.lookAt(matView, camera.position, camera.look, camera.up);

    // matProj = perspective(fov, aspect, near, far)
    mat4.perspective(matProj, camera.fov, camera.aspect, camera.near, camera.far);

    // matViewPr = matProj * matView
    mat4.multiply(matViewPr, matProj, matView);

    view.uniformMatrix4fv(matViewProj, false, matViewPr);

    plain.draw(matWorld);

    pyramid.update();
    pyramid.draw(matWorld);

    triPyramid.draw(matWorld);

    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
