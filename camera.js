export class Camera {
    #direction;
    #look;
    #boundUpdate;
    constructor(fov = 90, near = 0.1, far = 1000) {
        this.fov = fov * Math.PI / 180;
        this.near = near;
        this.far = far;
        this.position = [0, 3, 10];
        this.azimuth = 0;
        this.elevation = 0;
        this.#direction = [0, 0, -1];
        this.#look = [0, 3, 9];
        this.canvas = document.getElementById('canvas');
        this.view = this.canvas.getContext('webgl2');
        this.aspect = this.canvas.width / this.canvas.height;
        this.up = [0, 1, 0];
        if (!this.canvas.cameras) this.canvas.cameras = new Set([this]);
        else this.canvas.cameras.add(this);
        this.#boundUpdate = e => this.updateOrientation(e);

        document.addEventListener("pointerlockchange", () => {
            if (document.pointerLockElement === this.canvas) this.canvas.addEventListener("mousemove", this.#boundUpdate);
            else this.canvas.removeEventListener("mousemove", this.#boundUpdate);
        });
        this.canvas.addEventListener("mousedown", (e) => {
            if (e.button === 1) {
                if (document.pointerLockElement === this.canvas) document.exitPointerLock();
                else this.canvas.requestPointerLock();
            }
        });
    }
    turn(delta) { this.azimuth += delta; this.updateDirection(); }
    tilt(delta) {
        const maxElevation = Math.PI / 2 - 0.01;
        const minElevation = -maxElevation;
        this.elevation += delta;
        this.elevation = Math.max(minElevation, Math.min(maxElevation, this.elevation));
        this.updateDirection();
    }
    updateDirection() {
        const cosEl = Math.cos(this.elevation);
        this.#direction[0] = Math.sin(this.azimuth) * cosEl;
        this.#direction[1] = Math.sin(this.elevation);
        this.#direction[2] = -Math.cos(this.azimuth) * cosEl;
        this.updateLook();
    }
    updateLook() { // the direction of the camera by adding the direction vector to the position
        this.#look[0] = this.position[0] + this.#direction[0];
        this.#look[1] = this.position[1] + this.#direction[1];
        this.#look[2] = this.position[2] + this.#direction[2];
    }
    updateOrientation(e) { // update azimuth and elevation based on mouse movement
        const turnSpeed = 0.001;
        this.azimuth += e.movementX * turnSpeed;
        this.elevation -= e.movementY * turnSpeed;
        const maxElevation = Math.PI / 2 - 0.01;
        const minElevation = -maxElevation;
        this.elevation = Math.max(minElevation, Math.min(maxElevation, this.elevation));
        this.updateDirection();
    }
    get direction() { return this.#direction; }
    get look() { return this.#look; }
    lookAt(point) {
        const target = [
            point[0] - this.position[0],
            point[1] - this.position[1],
            point[2] - this.position[2]
        ];
        // calculate azimuth and elevation from target vector
        this.azimuth = Math.atan2(target[0], -target[2]);
        const distance = Math.hypot(target[0], target[1], target[2]);
        this.elevation = Math.asin(target[1] / distance);
        this.updateDirection();
    }
    forward(distance) {
        this.position[0] += this.direction[0] * distance;
        this.position[1] += this.direction[1] * distance;
        this.position[2] += this.direction[2] * distance;
        if (this.position[1] < 0.2) this.position[1] = 0.2;
        this.updateLook();
    }
    backward(distance) { this.forward(-distance); }
    strafeLeft(distance) {
        // const right = [
        //     Math.cos(this.azimuth),
        //     0,
        //     Math.sin(this.azimuth)
        // ];
        this.position[0] -= Math.cos(this.azimuth) * distance;
        //this.position[1] -= right[1] * distance;
        this.position[2] -= Math.sin(this.azimuth) * distance;
        this.updateLook();
    }
    strafeRight(distance) { this.strafeLeft(-distance); }
    elevate(distance) { this.position[1] += distance; this.#look[1] += distance; }
}
