import Key from "./key.js";

export default class Go {
    static get Forward() { return Key.Down("KeyW"); }
    static get Backward() { return Key.Down("KeyS"); }
    static get StrafeLeft() { return Key.Down("KeyA"); }
    static get StrafeRight() { return Key.Down("KeyD"); }
    static get TurnLeft() { return Key.Down("Comma") || Key.Down("ArrowLeft"); }
    static get TurnRight() { return Key.Down("Period") || Key.Down("ArrowRight"); }
    static get Shift() { return Key.Down("ShiftLeft") || Key.Down("ShiftRight"); }
    static get Ctrl() { return Key.Down("ControlLeft") || Key.Down("ControlRight"); }
    static get TiltUp() { return Key.Down("ArrowUp"); }
    static get TiltDown() { return Key.Down("ArrowDown"); }
    static get Higher() { return Key.Down("PageUp") || Key.Down("KeyE"); }
    static get Lower() { return Key.Down("PageDown") || Key.Down("KeyC"); }

    static get Reset() { return Key.Once("KeyR"); }
}
