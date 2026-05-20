import { vertex, fragment } from "./shaders.js";
import { Terrain } from "./terrain.js";
const X = 0, Y = 1, Z = 2;

export default class Util {
    static createBuffer(view, data, type) {
        console.assert(type === view.ARRAY_BUFFER || type === view.ELEMENT_ARRAY_BUFFER, "Invalid buffer type");
        const buffer = view.createBuffer();
        view.bindBuffer(type, buffer);
        view.bufferData(type, data, view.STATIC_DRAW);
        view.bindBuffer(type, null);
        return buffer;
    }
    static createShader(view, vertex, fragment) {
        const vertexShader = view.createShader(view.VERTEX_SHADER);
        const fragmentShader = view.createShader(view.FRAGMENT_SHADER);
        const program = view.createProgram();

        view.shaderSource(vertexShader, vertex);
        view.compileShader(vertexShader);

        view.shaderSource(fragmentShader, fragment);
        view.compileShader(fragmentShader);

        view.attachShader(program, vertexShader);
        view.attachShader(program, fragmentShader);
        view.linkProgram(program);
        return program;
    }
    static getPlaneVertices(size = 20, divisions = 10, c1 = [0.1, 0.1, 0.1], c2 = [0.3, 0.3, 0.3]) {
        const vertices = [];
        const terrain = [];
        // const tp1 = new Terrain(-5, 7, -5, 8);
        // const tp2 = new Terrain(5, -5, -5, 5);
        // terrain.push(tp1);
        // terrain.push(tp2);
        const terrainCount = 5;
        const limit = size * 0.9 / 2;
        for (let i = 0; i < terrainCount; i++) {
            const x = Util.random(-limit, limit);
            const z = Util.random(-limit, limit);
            let y = Util.random(3, 10);
            if (Math.random() < 0.5) y = -y;
            const r = Util.random(3, 10);
            const tp = new Terrain(x, y, z, r);
            terrain.push(tp);
        }

        const step = size / divisions;
        const start = -size / 2;
        // const squares = divisions * divisions;
        for (let row = 0; row < divisions; row++) {
            for (let col = 0; col < divisions; col++) {
                const swx = start + col * step;
                const swz = start + (row + 1) * step;

                const nex = start + (col + 1) * step;
                const nez = start + row * step;

                const nwx = start + col * step;
                const nwz = start + row * step;

                const sex = start + (col + 1) * step;
                const sez = start + (row + 1) * step;

                const isEvenSquare = (col + row) % 2 === 0;
                const color = isEvenSquare ? c1 : c2;
                //const c = isEvenSquare ? 0.1 : 0.3;

                let swh = 0; let neh = 0; let nwh = 0; let seh = 0;

                for (const t of terrain) {
                    swh += t.height({ x: swx, z: swz });
                    neh += t.height({ x: nex, z: nez });
                    nwh += t.height({ x: nwx, z: nwz });
                    seh += t.height({ x: sex, z: sez });
                }

                //Add four vertices for each square
                vertices.push(
                    swx, swh, swz, ...color,   // Bottom left
                    nex, neh, nez, ...color,   // Top right
                    nwx, nwh, nwz, ...color,   // Top left
                    sex, seh, sez, ...color,   // Bottom right
                );

            }
        }
        // vertices[3] = 0.8; // Adjust first vertex color red component for testing
        // vertices[4] = 0.8; // Adjust first vertex color green component for testing
        // vertices[5] = 0.8; // Adjust first vertex color blue component for testing
        // vertices[vertices.length - 1] = 1.0; // Adjust last vertex color blue component for testing

        // const fa = new Float32Array(vertices.length);
        // fa.set(vertices);
        return new Float32Array(vertices);
    }
    static getPlaneIndices(divisions = 10) {
        const indices = [];
        const pointsPerQuad = 4; // number of vertices pushed for each tile
        const tiles = divisions * divisions; // assumes a square plane with equal divisions in x and z
        for (let t = 0; t < tiles; t++) {
            const i = t * pointsPerQuad;
            const sw = i; // bottom left
            const ne = i + 1; // top right
            const nw = i + 2; // top left
            const se = i + 3; // bottom right
            indices.push(sw, ne, nw); // push 2 triangles for each tile to
            indices.push(sw, se, ne); // allow different heights over terrain
        }
        return new Uint32Array(indices);
    }
    static getPyramidVertices() {
        const model = [
            [+0, +1, +0], // 0 - top vertex
            [-1, -1, -1], // 1 - north west
            [+1, -1, -1], // 2 - north east
            [+1, -1, +1], // 3 - south east
            [-1, -1, +1]  // 4 - south west
        ];
        const vertices = [];
        // near face - navy
        const nearColor = Util.toRGB("Navy");
        vertices.push(...model[0], ...nearColor); // 0 - top
        vertices.push(...model[4], ...nearColor); // 2 - south west
        vertices.push(...model[3], ...nearColor); // 1 - south east

        // right face - maroon
        const rightColor = Util.toRGB("Maroon");
        vertices.push(...model[0], ...rightColor); // 3 - top
        vertices.push(...model[3], ...rightColor); // 5 - south east
        vertices.push(...model[2], ...rightColor); // 4 - north east

        // far face - olive
        const farColor = Util.toRGB("Olive");
        vertices.push(...model[0], ...farColor); // 6 - top
        vertices.push(...model[2], ...farColor); // 8 - north east
        vertices.push(...model[1], ...farColor); // 7 - north west

        // left face - purple
        const leftColor = Util.toRGB("Purple");
        vertices.push(...model[0], ...leftColor); // 9 - top
        vertices.push(...model[1], ...leftColor); // 11 - north west
        vertices.push(...model[4], ...leftColor); // 10 - south west

        // base - dodger blue
        const baseColor = Util.toRGB("DodgerBlue");
        vertices.push(...model[4], ...baseColor); // 12 - south west
        vertices.push(...model[1], ...baseColor); // 14 - north west
        vertices.push(...model[3], ...baseColor); // 13 - south east

        vertices.push(...model[3], ...baseColor); // 15 - south east
        vertices.push(...model[1], ...baseColor); // 17 - north west
        vertices.push(...model[2], ...baseColor); // 16 - north east

        return new Float32Array(vertices);
    }
    static getPyramidIndices() {
        return new Uint32Array([
            0, 1, 2,    // near face
            3, 4, 5,    // right face
            6, 7, 8,    // far face
            9, 10, 11,   // left face
            12, 13, 14,   // base triangle 1
            15, 16, 17    // base triangle 2
        ]);
    }
    static getVao(view, vertexBuffer, indexBuffer, posAttrib, colorAttrib) {
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
    static rotateY(v, a) {
        const cosAngle = Math.cos(a);
        const sinAngle = Math.sin(a);
        const x = v[X] * cosAngle - v[Z] * sinAngle;
        const z = v[X] * sinAngle + v[Z] * cosAngle;
        return [x, v[Y], z];
    }
    static rotate(point, axis, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const len = Math.hypot(axis[X], axis[Y], axis[Z]);
        const u = { x: axis[X] / len, y: axis[Y] / len, z: axis[Z] / len };

        const x = point[X] * cos +
            (u.y * point[Z] - u.z * point[Y]) * sin +
            u.x * (u.x * point[X] + u.y * point[Y] + u.z * point[Z]) * (1 - cos);

        const y = point[Y] * cos +
            (u.z * point[X] - u.x * point[Z]) * sin +
            u.y * (u.x * point[X] + u.y * point[Y] + u.z * point[Z]) * (1 - cos);

        const z = point[Z] * cos +
            (u.x * point[Y] - u.y * point[X]) * sin +
            u.z * (u.x * point[X] + u.y * point[Y] + u.z * point[Z]) * (1 - cos);

        return [x, y, z];
    }
    static addVectors(a, b) {
        return [a[X] + b[X], a[Y] + b[Y], a[Z] + b[Z]];
    }
    static addVectorsInPlace(a, b) {
        a[X] += b[X];
        a[Y] += b[Y];
        a[Z] += b[Z];
    }
    static scaleVector(v, s) {
        return [v[X] * s, v[Y] * s, v[Z] * s];
    }
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    static unitVector(v) {
        const length = Math.hypot(v[X], v[Y], v[Z]);
        return length === 0 ? [0, 0, 0] : [v[X] / length, v[Y] / length, v[Z] / length];
    }
    static #colorConverter = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    static toRGBA(color) {
        Util.#colorConverter.fillStyle = color;
        Util.#colorConverter.fillRect(0, 0, 1, 1);
        return Util.#colorConverter.getImageData(0, 0, 1, 1).data; // returns [r, g, b, a]
    }
    static toRGB(color) {
        const rgba = Util.toRGBA(color);
        return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255];
    }
}