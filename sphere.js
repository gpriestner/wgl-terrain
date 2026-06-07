import BaseShape from "./baseshape.js";
import Face from "./face.js";
import Util from "./util.js";

export default class Sphere extends BaseShape {
    model = [];
    rings = [];
    faces = [];
    constructor(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis, layers = 16, slices = 32) {
        super();
        this.layers = layers;
        this.slices = slices;
        this.createModel();
        this.createFaces();
        this.init(vertexPosition, vertexColor, position, scale, rotationAngle, Util.unitVector(rotationAxis));
    }
    createModel() {
        const zAngle = Math.PI / (this.layers + 1); // angle between each layer (including poles)
        const east = [1, 0, 0]; // initial point to be rotated
        const west = [-1, 0, 0]; // opposite point to the initial point

        this.model.push(east); // east
        for (let i = 1; i <= this.layers; ++i) {
            const newPoint = Util.rotateZ(east, i * zAngle);
            const newRing = this.generateRing(newPoint);
            this.rings.push(newRing);
            this.model.push(...newRing);
        }
        this.model.push(west);

        for (const [i, m] of this.model.entries()) m.index = i;

        // rotate all points around the z-axis
        // for (let i = 0; i < this.model.length; ++i) this.model[i] = Util.rotateZ(this.model[i], Math.PI / 2);

    }
    createFaces() {
        // populate faces directly around east pole (1 triangle per face)
        let firstRing = this.rings[0];
        for (let i = 1; i <= firstRing.length; ++i) {
            const p1 = firstRing[i - 1];
            const p2 = firstRing[i % firstRing.length];
            const color = i % 2 ? "white" : "red";
            const face = new Face([this.model[0].index, p1.index, p2.index], color);
            this.faces.push(face);
        }
        // populate faces directly around west pole (1 triangle per face)
        let lastRing = this.rings.at(-1);
        for (let i = 1; i <= lastRing.length; ++i) {
            const p1 = lastRing[i - 1];
            const p2 = lastRing[i % lastRing.length];
            const color = i % 2 ? "white" : "red";
            const face = new Face([this.model.at(-1).index, p2.index, p1.index], color);
            this.faces.push(face);
        }

        if (this.layers > 1) {
            // populate faces between rings (2 triangles per face)
            for (let i = 0; i < this.rings.length - 1; ++i) {
                const ring1 = this.rings[i];
                const ring2 = this.rings[i + 1];
                for (let j = 1; j <= ring1.length; ++j) {
                    const p1 = ring1[j - 1];
                    const p2 = ring1[j % ring1.length];
                    const p3 = ring2[j - 1];
                    const p4 = ring2[j % ring2.length];
                    const color = (i + j) % 2 ? "red" : "white";
                    this.faces.push(new Face([p1.index, p3.index, p2.index], color));
                    this.faces.push(new Face([p2.index, p3.index, p4.index], color));
                }
            }
        }
    }
    generateRing(point) {
        const ring = [];
        const angle = 2 * Math.PI / this.slices;
        ring.push(point);
        for (let i = 1; i < this.slices; ++i) {
            const newPoint = Util.rotateX(point, i * angle);
            ring.push(newPoint);
        }
        return ring;
    }
}
