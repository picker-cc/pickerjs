"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCache = void 0;
/**
 * redis缓存适配器
 */
class RedisCache {
    /**
     *
     * @param cache cache manager service
     */
    constructor(cache) {
        this.cache = cache;
        this.namespace = 'nest-wechat:';
    }
    async get(key) {
        if (!key) {
            throw new Error('empty key');
        }
        const newKey = this.namespace + key;
        let value = {};
        try {
            value = (await this.cache.get(newKey));
            if (!value) {
                value = {};
            }
        }
        catch (error) {
            value = {};
        }
        return value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async set(key, value, ttl) {
        if (!key) {
            throw new Error('empty key');
        }
        const newKey = this.namespace + key;
        let newTtl = ttl;
        if (!ttl) {
            newTtl = 0;
        }
        return this.cache.set(newKey, value, { ttl: newTtl });
    }
    remove(key) {
        if (!key)
            return false;
        const newKey = this.namespace + key;
        try {
            this.cache.del(newKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    close() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof this.cache.store.getClient === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const client = this.cache.store.getClient();
            if (client) {
                client.quit();
            }
        }
    }
}
exports.RedisCache = RedisCache;
