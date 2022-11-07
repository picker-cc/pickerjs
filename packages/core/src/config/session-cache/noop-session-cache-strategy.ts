import { CachedSession, SessionCacheStrategy } from './session-cache-strategy';

/**
 * @description
 * 不缓存的缓存查找每次都会失败，因此会话将总是从数据库中获取。
 *
 * @docsCategory auth
 */
export class NoopSessionCacheStrategy implements SessionCacheStrategy {
    clear(): any {
        return undefined;
    }

    delete(sessionToken: string): any {
        return undefined;
    }

    get(sessionToken: string): any {
        return undefined;
    }

    set(session: CachedSession): any {
        return undefined;
    }
}
