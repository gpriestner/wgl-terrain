
import BaseShape from "./baseshape.js";
import Face from "./face.js";
import Util from "./util.js";

export default class Torus extends BaseShape {
    model = [];
    rings = [];
    faces = [];
    constructor(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis, major = 3, minor = 1, layers = 80, slices = 32) {
        super();
        this.layers = layers;
        this.slices = slices;
        this.major = major;
        this.minor = minor;
        this.createModel();
        this.createFaces();
        this.init(vertexPosition, vertexColor, position, scale, rotationAngle, Util.unitVector(rotationAxis));
    }
    generateRing() {
        const initialPoint = [this.minor, 0, 0];
        const ring = [];
        const angle = 2 * Math.PI / this.slices;
        ring.push(initialPoint);
        for (let i = 1; i < this.slices; ++i) {
            const newPoint = Util.rotateZ(initialPoint, i * angle);
            ring.push(newPoint);
        }
        for (const point of ring) point[0] += this.major; // translate to the right
        return ring;
    }
    rotateRing(initialRing, angle) {
        const ring = [];
        for (const p of initialRing) {
            const newPoint = Util.rotateY(p, angle);
            ring.push(newPoint);
        }
        return ring;
    }
    createModel() {
        const firstRing = this.generateRing();
        this.rings.push(firstRing);
        this.model.push(...firstRing);

        // rotate entire ring around Y axis
        const angle = 2 * Math.PI / this.layers;
        for (let i = 1; i < this.layers; ++i) {
            const newRing = this.rotateRing(firstRing, i * angle);
            this.rings.push(newRing);
            this.model.push(...newRing);
        }
        for (const [i, m] of this.model.entries()) m.index = i;
    }
    createFaces() {
        for (let i = 0; i < this.rings.length; ++i) {
            const ring1 = this.rings[i];
            const ring2 = this.rings[(i + 1) % this.rings.length];
            for (let j = 1; j <= ring1.length; ++j) {
                const p1 = ring1[j - 1];
                const p2 = ring1[j % ring1.length];
                const p3 = ring2[j - 1];
                const p4 = ring2[j % ring2.length];
                const color = (i + j) % 2 ? "white" : "red";
                this.faces.push(new Face([p1.index, p2.index, p3.index], color));
                this.faces.push(new Face([p2.index, p4.index, p3.index], color));
            }
        }
    }
}
