"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapCache = void 0;
class MapCache {
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.map = new Map();
    }
    get(key) {
        return new Promise((resolve) => {
            resolve(this.map.get(key));
        });
    }
    set(key, value) {
        this.map.set(key, value);
    }
    remove(key) {
        return this.map.delete(key);
    }
    close() {
        return;
    }
}
exports.MapCache = MapCache;
