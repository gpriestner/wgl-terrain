import { mat4, vec3, glMatrix, quat } from 'https://cdn.skypack.dev/gl-matrix';
import Process from './process.js';
import { view } from './canvas.js';

export default class Shape {
    constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices) {
        this.pos = pos;
        this.scale = scale;
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
        this.vao = vao;
        this.numIndices = numIndices;
        this.matWorld = mat4.create();
        this.scaleVec = vec3.create();
        this.rotation = quat.create();
        this.rotationSpeed = glMatrix.toRadian(Math.PI * 10) * Math.random() * 5; // radians per second
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
            this.pos,
            this.scaleVec
        );

        view.uniformMatrix4fv(matWorldUniform, false, this.matWorld);
        view.bindVertexArray(this.vao);
        view.drawElements(view.TRIANGLES, this.numIndices, view.UNSIGNED_INT, 0); 
        view.bindVertexArray(null);
    }
}
