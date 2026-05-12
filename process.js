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
}
