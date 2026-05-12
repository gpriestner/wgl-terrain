import { vertex, fragment } from "./shaders.js";
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
        // const terrain = [];
        // const tp1 = new Terrain(-5, 7, -5, 8);
        // const tp2 = new Terrain(5, -5, -5, 5);
        // terrain.push(tp1);
        // terrain.push(tp2);
        // const terrainCount = 500;
        // for (let i = 0; i < terrainCount; i++) {
        //     const x = random(-size, size);
        //     let y = random(3, 10);
        //     if (Math.random() < 0.5) y = -y;
        //     const z = random(-size, size);
        //     const r = random(3, 10);
        //     const tp = new Terrain(x, y, z, r);
        //     terrain.push(tp);
        // }

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

                // for (const t of terrain) {
                //     swh += t.height({ x: swx, z: swz });
                //     neh += t.height({ x: nex, z: nez });
                //     nwh += t.height({ x: nwx, z: nwz });
                //     seh += t.height({ x: sex, z: sez });
                // }

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
        const pointsPerQuad = 4; // number of verticies pushed for each tile
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
    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
}