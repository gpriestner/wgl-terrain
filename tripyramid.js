import { canvas, view } from './canvas.js';
import { mat4, vec3, glMatrix, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Util from './util.js';
import Process from './process.js';

export class TriPyramid {
    model = [
        [0, 1, 0], // 0 - top
        [0, -1, -1], // 1 - north
        [0.86602540378, -1, 0.5], // 2 - south east
        [-0.86602540378, -1, 0.5], // 3 - south west
    ];
    indices = [];//
    //     0, 1, 2, // 0 - right face
    //     3, 4, 5, // 1 - near face
    //     6, 7, 8, // 2 - left face
    //     9, 10, 11, // 3 - base
    // ];
    colors = [
        "purple", // right face
        "Chocolate", // near face
        "blue", // left face
        "yellow", // base
    ];
    constructor(position, vertexPosition, vertexColor, scale = 1, rotationAngle = 0, rotationAxis = [0, 1, 0]) {
        this.position = position;
        this.scale = scale;
        this.rotationAngle = rotationAngle;
        this.rotationAxis = rotationAxis;
        this.vertexPosition = vertexPosition; // view.getAttribLocation(shader, 'vertexPosition');
        this.vertexColor = vertexColor; // view.getAttribLocation(shader, 'vertexColor');

        const vertices = this.getVertices();
        this.vBuffer = this.createBuffer(vertices, view.ARRAY_BUFFER);
        const indices = this.getIndices();
        this.indexCount = indices.length; // number of indices
        this.iBuffer = this.createBuffer(indices, view.ELEMENT_ARRAY_BUFFER);

        this.vao = this.getVao(this.vBuffer, this.iBuffer, this.vertexPosition, this.vertexColor);

        this.matWorld = mat4.create();
        this.scaleVec = vec3.create();
        this.rotation = quat.create();
        this.rotationSpeed = 1;
    }
    getVertices() {
        const vertices = [];

        // right face - red
        const colorRight = Util.toRGB("lime");
        vertices.push(...this.model[0], ...colorRight); // 0 - top
        vertices.push(...this.model[2], ...colorRight); // 1 - south east
        vertices.push(...this.model[1], ...colorRight); // 2 - north
        this.indices.push(0, 1, 2);

        // near face - green
        const colorNear = Util.toRGB(this.colors[1]);
        vertices.push(...this.model[0], ...colorNear); // 3 - top
        vertices.push(...this.model[3], ...colorNear); // 4 - south west
        vertices.push(...this.model[2], ...colorNear); // 5 - south east
        this.indices.push(3, 4, 5);

        // left face - blue
        const colorLeft = Util.toRGB(this.colors[2]);
        vertices.push(...this.model[0], ...colorLeft); // 6 - top
        vertices.push(...this.model[1], ...colorLeft); // 7 - north
        vertices.push(...this.model[3], ...colorLeft); // 8 - south west
        this.indices.push(6, 7, 8);

        // base - yellow
        const colorBase = Util.toRGB(this.colors[3]);
        vertices.push(...this.model[1], ...colorBase); // 9 - north
        vertices.push(...this.model[2], ...colorBase); // 10 - south east
        vertices.push(...this.model[3], ...colorBase); // 11 - south west
        this.indices.push(9, 10, 11);

        return new Float32Array(vertices);
    }
    getIndices() {
        return new Uint32Array(this.indices);
    }
    createBuffer(data, type) {
        console.assert(type === view.ARRAY_BUFFER || type === view.ELEMENT_ARRAY_BUFFER, "Invalid buffer type");
        const buffer = view.createBuffer();
        console.assert(buffer, "Failed to create buffer");
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
    update() {
        this.rotationAngle += this.rotationSpeed * Process.DT;
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
        view.drawElements(view.TRIANGLES, this.indexCount, view.UNSIGNED_INT, 0);
        view.bindVertexArray(null);
    }
}