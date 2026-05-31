export default class Scene {
    objects = [];
    add(o) { o.scene = this; this.objects.push(o); }
    update() { for (let o of this.objects) o.update(); }
    draw(m) { for (let o of this.objects) o.draw(m); }
}