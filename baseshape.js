import { mat4, vec3, quat } from 'https://cdn.skypack.dev/gl-matrix';
import { view } from './canvas.js';
import Util from './util.js';
import Process from './process.js';

export default class BaseShape {
    init(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis) {
        this.vPyramid = this.getVertices();
        this.vbPyramid = this.createBuffer(this.vPyramid, view.ARRAY_BUFFER);
        this.vaoPyramid = this.getVao(vertexPosition, vertexColor);

        this.position = position;
        this.scale = scale;
        this.rotationAngle = rotationAngle;
        this.rotationAxis = rotationAxis;
        //this.numIndices = this.faces.length * 3; // this needs to go in the child class

        this.matWorld = mat4.create();
        this.scaleVec = vec3.create();
        this.rotation = quat.create();
        this.rotationSpeed = 0;
    }
    get numIndices() {
        return this.faces.length * 3;
    }
    createVertex(vertices, color, indices) {
        const rgb = Util.toRGB(color);
        for (let i of indices) vertices.push(...this.model[i], ...rgb);
    }
    getVertices() {
        const vertices = [];
        for (let face of this.faces) this.createVertex(vertices, face.color, face.indicies); 
        return new Float32Array(vertices);
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
        view.bindVertexArray(null); // clear the binding

        return vao;
    }
    update() { 
        if (this.rotationSpeed) this.rotationAngle += this.rotationSpeed * Process.DT;
    }
    draw(matWorldUniform) {
        quat.setAxisAngle(this.rotation, this.rotationAxis, this.rotationAngle);
        vec3.set(this.scaleVec, this.scale, this.scale, this.scale);
        mat4.fromRotationTranslationScale(this.matWorld, this.rotation, this.position, this.scaleVec);
        view.uniformMatrix4fv(matWorldUniform, false, this.matWorld);
        view.bindVertexArray(this.vaoPyramid);
        view.drawArrays(view.TRIANGLES, 0, this.numIndices);
        view.bindVertexArray(null);
    }
}
