import Util from "./util.js";
const canvas = document.getElementById('canvas');
export default class Nav {
    static Azimuth = 0;
    static Elevation = 0;
    static #FORWARD = [0, 0, -1];
    static #RIGHT = [1, 0, 0];
    //static #UP = [0, 1, 0];
    static get Lookat() {
        const heading = Util.rotateY(Nav.#FORWARD, Nav.Azimuth);
        const axis = Util.rotateY(Nav.#RIGHT, Nav.Azimuth);
        const lookat = Util.rotate(heading, axis, Nav.Elevation);
        return lookat;
    }
    static get Direction() {
        const cosEl = Math.cos(Nav.Elevation);
        return [
            Math.sin(Nav.Azimuth) * cosEl,
            Math.sin(Nav.Elevation),
            -Math.cos(Nav.Azimuth) * cosEl
        ];
    }
    static {
        document.addEventListener("pointerlockchange", () => {
            if (document.pointerLockElement === canvas) canvas.addEventListener("mousemove", Nav.update);
            else canvas.removeEventListener("mousemove", Nav.update);
        });
        canvas.addEventListener("click", () => {
            if (document.pointerLockElement === canvas) document.exitPointerLock();
            else canvas.requestPointerLock();
        });
        canvas.addEventListener("wheel", (event) => {
            cameraPos[Y] -= event.deltaY * 0.003 * (Key.Shift * 5 + 1);
            cameraPos[Y] = Util.clamp(cameraPos[Y], 0.1, 80);
        });
    }
    static update(e) {
        const turnSpeed = 0.001;
        Nav.Azimuth += e.movementX * turnSpeed;
        Nav.Elevation -= e.movementY * turnSpeed;
        Nav.Elevation = Util.clamp(Nav.Elevation, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    }
}
