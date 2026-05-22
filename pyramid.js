import { canvas, view } from './canvas.js';
import { mat4, vec3, glMatrix, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Util from './util.js';
import Process from './process.js';

export class Pyramid {
    model = [
        [+0, +1, +0], // 0 - top vertex
        [-1, -1, -1], // 1 - north west
        [+1, -1, -1], // 2 - north east
        [+1, -1, +1], // 3 - south east
        [-1, -1, +1], // 4 - south west
    ];
    faces = [
        [0, 4, 3], // near face
        [0, 3, 2], // right face
        [0, 2, 1], // far face
        [0, 1, 4], // left face
        [4, 1, 3], // base triangle 1
        [3, 1, 2], // base triangle 2
    ];
    colors = [ "hotpink", "darkgreen", "Olive", "lime", "navy", "navy" ];
    constructor(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis) {
        this.vPyramid = this.getVertices();
        //this.iPyramid = this.getIndices();
        this.vbPyramid = this.createBuffer(this.vPyramid, view.ARRAY_BUFFER);
        //this.ibPyramid = this.createBuffer(this.iPyramid, view.ELEMENT_ARRAY_BUFFER);
        this.vaoPyramid = this.getVao(vertexPosition, vertexColor);

        this.position = position;
        this.scale = scale;
        this.rotationAngle = rotationAngle;
        this.rotationAxis = rotationAxis;
        this.numIndices = this.faces.length * 3; // this.iPyramid.length;

        this.matWorld = mat4.create();
        this.scaleVec = vec3.create();
        this.rotation = quat.create();
        this.rotationSpeed = 1;
    }
    createVertex(vertices, color, indices) {
        const rgb = Util.toRGB(color);
        for (let i of indices) vertices.push(...this.model[i], ...rgb);
    }
    getVertices() {
        const vertices = [];
        for (let i = 0; i < this.faces.length; i++) this.createVertex(vertices, this.colors[i], this.faces[i]);
        return new Float32Array(vertices);
    }
    // getIndices() {
    //     return new Uint32Array(this.indices);
    // }
    createBuffer(data, type) {
        console.assert(type === view.ARRAY_BUFFER || type === view.ELEMENT_ARRAY_BUFFER, "Invalid buffer type");
        const buffer = view.createBuffer();
        console.assert(buffer, "Failed to create buffer");
        view.bindBuffer(type, buffer);
        view.bufferData(type, data, view.STATIC_DRAW);
        view.bindBuffer(type, null);
        return buffer;
    }
    getVao(posAttrib, colorAttrib) {
        const vao = view.createVertexArray();
        view.bindVertexArray(vao);

        // Interleaved format: XYZ RGB (6 floats per vertex = 24 bytes)
        view.bindBuffer(view.ARRAY_BUFFER, this.vbPyramid);
        view.vertexAttribPointer(posAttrib, 3, view.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        view.enableVertexAttribArray(posAttrib);
        view.vertexAttribPointer(colorAttrib, 3, view.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        view.enableVertexAttribArray(colorAttrib);
        view.bindBuffer(view.ARRAY_BUFFER, null); // clear the binding

        //view.bindBuffer(view.ELEMENT_ARRAY_BUFFER, indexBuffer);
        view.bindVertexArray(null); // clear the binding
        //view.bindBuffer(view.ELEMENT_ARRAY_BUFFER, null); // clear the binding

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
        view.bindVertexArray(this.vaoPyramid);
        //view.drawElements(view.TRIANGLES, this.numIndices, view.UNSIGNED_INT, 0); 
        view.drawArrays(view.TRIANGLES, 0, this.numIndices);
        view.bindVertexArray(null);
    }
}