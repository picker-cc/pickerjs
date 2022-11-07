import { CachedSession, SessionCacheStrategy } from './session-cache-strategy';

/**
 * @description
 * 在内存中缓存会话，使用 LRU（Least Recently Used） 缓存实现。不适合多服务器设置，因为缓存对每个实例都是本地的，
 * 这会降低其有效性。默认情况下，缓存的大小为 1000，这意味着在缓存了1000个会话之后，任何新会话都会导致最近
 * 使用最少的会话将从缓存中移除（删除）
 *
 * 缓存大小可以通过传递一个不同的数字给构造函数来配置
 * @docsCategory auth
 */
export class InMemorySessionCacheStrategy implements SessionCacheStrategy {
    private readonly cache = new Map<string, CachedSession>();
    private readonly cacheSize: number = 1000;

    constructor(cacheSize?: number) {
        if (cacheSize != null) {
            if (cacheSize < 1) {
                throw new Error(`cacheSize 必需为正整数`);
            }
            this.cacheSize = Math.round(cacheSize);
        }
    }

    delete(sessionToken: string) {
        this.cache.delete(sessionToken);
    }

    get(sessionToken: string) {
        const item = this.cache.get(sessionToken);
        if (item) {
            // refresh key
            this.cache.delete(sessionToken);
            this.cache.set(sessionToken, item);
        }
        return item;
    }

    set(session: CachedSession) {
        this.cache.set(session.token, session);

        if (this.cache.has(session.token)) {
            // refresh key
            this.cache.delete(session.token);
        } else if (this.cache.size === this.cacheSize) {
            // evict oldest
            this.cache.delete(this.first());
        }
        this.cache.set(session.token, session);
    }

    clear() {
        this.cache.clear();
    }

    private first() {
        return this.cache.keys().next().value;
    }
}
