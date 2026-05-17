export class Terrain {
    constructor(x, y, z, r, l = -3) {
        this.position = { x, y, z };
        this.radius = r;
        this.lowest = l;
    }
    height(p) {
        const horzDist = Math.hypot(this.position.x - p.x ?? p[0], this.position.z - p.z ?? p[2]);
        if (horzDist > this.radius) return 0;
        const t = horzDist / this.radius;
        let h = this.smootherstep(this.position, { x: p[0], y: 0, z: p[2] }, t).y;
        //const h = this.lerp(this.position, { x: p[0], y: 0, z: p[2] }, t).y;
        if (this.lowest) h = Math.max(h, this.lowest);
        return h;
    }
    lerp(a, b, t) {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            z: a.z + (b.z - a.z) * t,
        };
    }
    smoothstep(a, b, t) {
        const tt = t * t * (3 - 2 * t);
        return this.lerp(a, b, tt);
    }
    smootherstep(a, b, t) {
        const tt = t * t * t * (t * (t * 6 - 15) + 10);
        return this.lerp(a, b, tt);
    }
}
