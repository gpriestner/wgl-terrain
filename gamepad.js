export class GamePad {
  static Down = 0; static Right = 1; static Up = 2; static Left = 3; static LeftBumper = 4; 
  static RightBumper = 5; static LeftTrigger = 6; static RightTrigger = 7; static Restart = 8; 
  static Pause = 9; static LeftJoyPressed = 10; static RightJoyPressed = 11; static UpJoyPad = 12; 
  static DownJoyPad = 13; static LeftJoyPad = 14; static RightJoyPad = 15;

  static isConnected = false;
  static current = null;
  static previous = null;
  static {
    addEventListener("gamepadconnected", (event) => {
      GamePad.current = navigator.getGamepads()[0];
      GamePad.previous = GamePad.current;
      GamePad.isConnected = true;
    });
    addEventListener("gamepaddisconnected", (event) => {
      GamePad.isConnected = false;
    });
  }
  static update() {
    if (GamePad.isConnected) {
      GamePad.previous = GamePad.current;
      GamePad.current = navigator.getGamepads()[0];
    }
  }
  static isDown(button) {
    return GamePad.isConnected && !!GamePad?.current?.buttons[button].pressed;
  }
  static isPressed(button) {
    return (
      GamePad.isConnected &&
      GamePad?.current?.buttons[button].pressed &&
      !GamePad?.previous?.buttons[button].pressed
    );
  }
  static value(button) {
    if (!GamePad.isConnected) return 0;
    else return GamePad?.current?.buttons[button].value;
  }
  static get angle() {
    if (GamePad.isConnected) {
      const x = GamePad.current?.axes[0];
      const y = GamePad.current?.axes[1];

      if (!(x > -0.15 && x < 0.15 && y > -0.15 && y < 0.15)) {
        const ang = Math.atan2(y, x);
        return ang;
      }
    }
    return null;
  }
}
