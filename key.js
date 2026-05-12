export default class Key {
    static #keys = new Set();
    static {
        addEventListener("keydown", e => !e.repeat && Key.#keys.add(e.code));
        addEventListener("keyup", e => Key.#keys.delete(e.code));
    }
    static Down = key => Key.#keys.has(key);
    static Once = key => Key.#keys.delete(key);
}
