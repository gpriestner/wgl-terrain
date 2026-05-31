import BaseShape from "./baseshape.js";
import Face from "./face.js";

export default class Cube extends BaseShape {
    model = [
        [-1, 1, 1],   // 0
        [-1, -1, 1],  // 1
        [1, 1, 1],    // 2
        [1, -1, 1],   // 3
        [1, 1, -1],   // 4
        [1, -1, -1],  // 5
        [-1, 1, -1],  // 6
        [-1, -1, -1], // 7
    ];
    faces = [
        // near
        new Face([0, 1, 2], "yellow"),
        new Face([1, 3, 2], "yellow"),
        // right
        new Face([2, 3, 4], "red"),
        new Face([3, 5, 4], "red"),
        // far
        new Face([4, 5, 6], "green"),
        new Face([5, 7, 6], "green"),
        // left
        new Face([6, 7, 0], "pink"),
        new Face([7, 1, 0], "pink"),
        // top
        new Face([0, 4, 6], "grey"),
        new Face([2, 4, 0], "grey"),
        // bottom
        new Face([7, 3, 1], "purple"),
        new Face([7, 5, 3], "purple"),
    ];
    constructor(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis) {
        super();
        this.init(vertexPosition, vertexColor, position, scale, rotationAngle, rotationAxis);
    }
}
