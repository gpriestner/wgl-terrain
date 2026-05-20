import { canvas } from "./canvas.js"

export default class Mouse {
    static #forward = false;
    static #backward = false;
    static #wheelUp = false;
    static #wheelDown = false;
    static #wheelVerticalTimeout = null;
    static #wheelLeft = false;
    static #wheelRight = false;
    static #wheelHorizontalTimeout = null;
    static {
        canvas.addEventListener("mousedown", (event) => {
            if (event.button === 0 || event.button === 4) Mouse.#forward = true;
            if (event.button === 2 || event.button === 3) Mouse.#backward = true;
            event.preventDefault();
        });
        canvas.addEventListener("mouseup", (event) => {
            if (event.button === 0 || event.button === 4) Mouse.#forward = false;
            if (event.button === 2 || event.button === 3) Mouse.#backward = false;
            event.preventDefault();
        });
        canvas.addEventListener("wheel", (event) => {
            if (event.deltaY < 0) Mouse.#wheelUp = true;
            if (event.deltaY > 0) Mouse.#wheelDown = true;
            if (Mouse.#wheelUp || Mouse.#wheelDown) {
                clearTimeout(Mouse.#wheelVerticalTimeout);
                Mouse.#wheelVerticalTimeout = setTimeout(() => {
                    Mouse.#wheelUp = false;
                    Mouse.#wheelDown = false;
                }, 100);
            }

            if (event.deltaX < 0) Mouse.#wheelLeft = true;
            if (event.deltaX > 0) Mouse.#wheelRight = true;
            if (Mouse.#wheelLeft || Mouse.#wheelRight) {
                clearTimeout(Mouse.#wheelHorizontalTimeout);
                Mouse.#wheelHorizontalTimeout = setTimeout(() => {
                    Mouse.#wheelLeft = false;
                    Mouse.#wheelRight = false;
                }, 100);
            }
            event.preventDefault();
        });
    }
    static get Forward() { return Mouse.#forward; }
    static get Backward() { return Mouse.#backward; }
    static get Left() { return Mouse.#wheelLeft; }
    static get Right() { return Mouse.#wheelRight; }
    static get WheelUp() { return Mouse.#wheelUp; }
    static get WheelDown() { return Mouse.#wheelDown; }
}