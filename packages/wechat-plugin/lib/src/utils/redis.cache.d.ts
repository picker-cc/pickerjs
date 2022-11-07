import { Cache } from 'cache-manager';
import { ICache } from '../types/utils';
/**
 * redis缓存适配器
 */
export declare class RedisCache implements ICache {
    readonly cache: Cache;
    private namespace;
    /**
     *
     * @param cache cache manager service
     */
    constructor(cache: Cache);
    get<T>(key: string): Promise<T>;
    set(key: string, value: any, ttl?: number): Promise<any>;
    remove(key: string): boolean;
    close(): void;
}
