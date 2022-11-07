/**
 * @description
 * 该服务用于缓存与正在进行的请求相关的任意数据。
 * 它通过使用绑定到当前RequestContext的WeakMap来实现这一点，
 * 因此缓存的数据在请求期间是可用的。
 * 一旦请求完成，缓存的数据将自动被垃圾回收。
 */
import {RequestContext} from "../api/common/request-context";

export class RequestContextCacheService {
    private caches = new WeakMap<RequestContext, Map<any, any>>();

    set<T = any>(ctx: RequestContext, key: any, val: T): void {
        this.getContextCache(ctx).set(key, val);
    }

    get<T = any>(ctx: RequestContext, key: any): T | undefined;
    get<T>(ctx: RequestContext, key: any, getDefault?: () => T): T;
    get<T>(ctx: RequestContext, key: any, getDefault?: () => T): T | Promise<T> | undefined {
        const ctxCache = this.getContextCache(ctx);
        const result = ctxCache.get(key);
        if (result) {
            return result;
        }
        if (getDefault) {
            const defaultResultOrPromise = getDefault();
            ctxCache.set(key, defaultResultOrPromise);
            return defaultResultOrPromise;
        } else {
            return;
        }
    }

    private getContextCache(ctx: RequestContext): Map<any, any> {
        let ctxCache = this.caches.get(ctx);
        if (!ctxCache) {
            ctxCache = new Map<any, any>();
            this.caches.set(ctx, ctxCache);
        }
        return ctxCache;
    }

    private isPromise<T>(input: T | Promise<T>): input is Promise<T> {
        return typeof (input as any).then === 'function';
    }
}
