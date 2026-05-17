import Go from "./go.js";
export default class Process {
    static DT = 0;
    static FPS = 0;
    static #frameCount = 0;
    static #prevTime = 0;
    static #accTime = 0;
    static #accTimeMs = 0;
    static #prevTimeMs = 0;
    static #frameLimit = 0;
    static Frame(ts) {
        if (Process.#frameLimit > 0) {
            Process.#accTimeMs += ts - Process.#prevTimeMs;
            Process.#prevTimeMs = ts;
            if (Process.#accTimeMs < Process.#frameLimit) return;
            Process.#accTimeMs = 0;
        }
        Process.#frameCount += 1;
        Process.DT = (ts - Process.#prevTime) / 1000;
        Process.#prevTime = ts;
        Process.#accTime += Process.DT;
        if (Process.#accTime >= 1) {
            Process.FPS = Process.#frameCount;
            Process.#frameCount = 0;
            Process.#accTime = 0;
            if (msgFps) msgFps.textContent = `FPS: ${Process.FPS}`;
        }
    }
    static SetFrameLimit(limit) {
        Process.#frameLimit = 1000 / limit;
    }
    static Input(camera) {
        const unitsPerSecond = 5;
        const turnsPerSecond = 0.1;
        let turnSpeed = turnsPerSecond * Math.PI * 2 * Process.DT;
        let moveSpeed = unitsPerSecond * Process.DT;
        let factor = 1;
        if (Go.Shift) factor = 5;
        if (Go.Ctrl) factor = 0.2;
        turnSpeed *= factor;
        moveSpeed *= factor;

        if (Go.Forward) camera.forward(moveSpeed);
        if (Go.Backward) camera.backward(moveSpeed);
        if (Go.StrafeLeft) camera.strafeLeft(moveSpeed);
        if (Go.StrafeRight) camera.strafeRight(moveSpeed);
        if (Go.TurnLeft) camera.turn(-turnSpeed);
        if (Go.TurnRight) camera.turn(turnSpeed);
        if (Go.TiltUp) camera.tilt(turnSpeed);
        if (Go.TiltDown) camera.tilt(-turnSpeed);
        if (Go.Higher) camera.elevate(moveSpeed);
        if (Go.Lower) camera.elevate(-moveSpeed);
    }
}
