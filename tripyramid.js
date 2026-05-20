import { canvas, view } from './canvas.js';
import { mat4, vec3, glMatrix, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Util from './util.js';

export class TriPyramid {
    model = [
        [0, 1, 0], // 0 - top
        [0, 0, 1], // 1 - north
        [Math.PI * 2 / 3, 0, -0.5], // 2 - south east
        [-Math.PI * 2 / 3, 0, -0.5], // 3 - south west
    ];
    indices = [
        0, 2, 1, // 0 - right face
        0, 3, 2, // 1 - near face
        0, 1, 3, // 2 - left face
        1, 2, 3, // 3 - base
    ];
    colors = [
        "red", // right face
        "green", // near face
        "blue", // left face
        "yellow", // base
    ];
    constructor(shader, position, scale = 1, rotationAngle = 0, rotationAxis = [0, 1, 0]) {
        this.shader = shader;
        this.position = position;
        this.scale = scale;
        this.rotationAngle = rotationAngle;
        this.rotationAxis = rotationAxis;
        this.vertexPosition = view.getAttribLocation(shader, 'vertexPosition');
        this.vertexColor = view.getAttribLocation(shader, 'vertexColor');

        this.vBuffer = this.createBuffer(this.getVertices(), view.ARRAY_BUFFER);
        this.iBuffer = this.createBuffer(this.getIndices(), view.ELEMENT_ARRAY_BUFFER);

        this.vao = this.getVao(this.vBuffer, this.iBuffer, this.vertexPosition, this.vertexColor);

        this.matWorld = mat4.create();
        this.scaleVec = vec3.create();
        this.rotation = quat.create();
        this.rotationSpeed = 1;
    }
    getVertices() {
        const vertices = [];
        // right face - red
        vertices.push(...this.model[0], ...Util.toRGB(this.colors[0])); // 0 - top
        vertices.push(...this.model[2], ...Util.toRGB(this.colors[0])); // 2 - south east
        vertices.push(...this.model[1], ...Util.toRGB(this.colors[0])); // 1 - north
        // near face - green
        vertices.push(...this.model[0], ...Util.toRGB(this.colors[1])); // 0 - top
        vertices.push(...this.model[3], ...Util.toRGB(this.colors[1])); // 3 - south west
        vertices.push(...this.model[2], ...Util.toRGB(this.colors[1])); // 2 - south east
        // left face - blue
        vertices.push(...this.model[0], ...Util.toRGB(this.colors[2])); // 0 - top
        vertices.push(...this.model[1], ...Util.toRGB(this.colors[2])); // 1 - north
        vertices.push(...this.model[3], ...Util.toRGB(this.colors[2])); // 3 - south west
        // base - yellow
        vertices.push(...this.model[1], ...Util.toRGB(this.colors[3])); // 1 - north
        vertices.push(...this.model[2], ...Util.toRGB(this.colors[3])); // 2 - south east
        vertices.push(...this.model[3], ...Util.toRGB(this.colors[3])); // 3 - south west

        return new Float32Array(vertices);
    }
    getIndices() {
        return new Uint16Array(this.indices);
    }
    createBuffer(data, type) {
        console.assert(type === view.ARRAY_BUFFER || type === view.ELEMENT_ARRAY_BUFFER, "Invalid buffer type");
        const buffer = view.createBuffer();
        view.bindBuffer(type, buffer);
        view.bufferData(type, data, view.STATIC_DRAW);
        view.bindBuffer(type, null);
        return buffer;
    }
    getVao(vertexBuffer, indexBuffer, posAttrib, colorAttrib) {
        const vao = view.createVertexArray();
        view.bindVertexArray(vao);

        // Interleaved format: XYZ RGB (6 floats per vertex = 24 bytes)
        view.bindBuffer(view.ARRAY_BUFFER, vertexBuffer);
        view.vertexAttribPointer(posAttrib, 3, view.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        view.enableVertexAttribArray(posAttrib);
        view.vertexAttribPointer(colorAttrib, 3, view.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        view.enableVertexAttribArray(colorAttrib);
        view.bindBuffer(view.ARRAY_BUFFER, null); // clear the binding

        view.bindBuffer(view.ELEMENT_ARRAY_BUFFER, indexBuffer);
        view.bindVertexArray(null); // clear the binding
        view.bindBuffer(view.ELEMENT_ARRAY_BUFFER, null); // clear the binding

        return vao;
    }
    draw(matWorldUniform) {
        quat.setAxisAngle(this.rotation, this.rotationAxis, this.rotationAngle);
        vec3.set(this.scaleVec, this.scale, this.scale, this.scale);
        mat4.fromRotationTranslationScale(
            this.matWorld,
            this.rotation,
            this.position,
            this.scaleVec
        );

        view.uniformMatrix4fv(matWorldUniform, false, this.matWorld);
        view.bindVertexArray(this.vao);
        view.drawElements(view.TRIANGLES, this.numIndices, view.UNSIGNED_INT, 0);
        view.bindVertexArray(null);
    }
}