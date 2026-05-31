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
        this.init(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis);
    }
    createModel() {
        const zAngle = Math.PI / (this.layers + 1); // angle between each layer (including poles)
        const east = [1, 0, 0]; // initial point to be rotated
        const west = [-1, 0, 0]; // opposite point to the initial point

        this.model.push(east); // east
        for (let i = 1; i <= this.layers; ++i) {
            const newPoint = Util.rotateZ(east, i * zAngle);
            const newRing = this.generateRing(newPoint, this.slices);
            this.rings.push(newRing);
            this.model.push(...newRing);
        }
        this.model.push(west);

        for (const [i, m] of this.model.entries()) m.index = i;

        // populate faces directly around east pole
        let firstRing = this.rings[0];
        for (let i = 1; i <= firstRing.length; ++i) {
            const p1 = firstRing[i - 1];
            const p2 = firstRing[i % firstRing.length];
            const face = new Face([east.index, p1.index, p2.index], Util.randomColor());
            this.faces.push(face);
        }
        // populate faces directly around west pole
        let lastRing = this.rings.at(-1);
        for (let i = 1; i <= lastRing.length; ++i) {
            const p1 = lastRing[i - 1];
            const p2 = lastRing[i % lastRing.length];
            const face = new Face([west.index, p2.index, p1.index], Util.randomColor());
            this.faces.push(face);
        }

        if (this.layers > 1) {
            // populate faces between rings
            for (let i = 0; i < this.rings.length - 1; ++i) {
                const ring1 = this.rings[i];
                const ring2 = this.rings[i + 1];
                for (let j = 1; j <= ring1.length; ++j) {
                    const p1 = ring1[j - 1];
                    const p2 = ring1[j % ring1.length];
                    const p3 = ring2[j - 1];
                    const p4 = ring2[j % ring2.length];
                    const color = Util.randomColor();
                    this.faces.push(new Face([p1.index, p3.index, p2.index], color));
                    this.faces.push(new Face([p2.index, p3.index, p4.index], color));
                }
            }
        }
    }
    generateRing(point, count) {
        const ring = [];
        const angle = 2 * Math.PI / count;
        ring.push(point);
        for (let i = 1; i < count; ++i) {
            const newPoint = Util.rotateX(point, i * angle);
            ring.push(newPoint);
        }
        return ring;
    }
    createModel2(latBands, longBands) {
        for (let lat = 0; lat <= latBands; lat++) {
            const theta = lat * Math.PI / latBands;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            for (let long = 0; long <= longBands; long++) {
                const phi = long * 2 * Math.PI / longBands;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                const x = cosPhi * sinTheta * this.scale;
                const y = cosTheta * this.scale;
                const z = sinPhi * sinTheta * this.scale;
                this.model.push([x, y, z]);
            }
        }
        for (let lat = 0; lat < latBands; lat++) {
            for (let long = 0; long < longBands; long++) {
                const first = (lat * (longBands + 1)) + long;
                const second = first + longBands + 1;
                this.faces.push(new Face([first, second, first + 1], "red"));
                this.faces.push(new Face([second, second + 1, first + 1], "white"));
            }
        }
    }
}
