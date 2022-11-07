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
        key = this.namespace + key;
        let value = {};
        try {
            value = await this.cache.get(key);
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
        key = this.namespace + key;
        if (!ttl) {
            ttl = 0;
        }
        return this.cache.set(key, value, { ttl });
    }
    remove(key) {
        if (!key)
            return false;
        key = this.namespace + key;
        try {
            this.cache.del(key);
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
