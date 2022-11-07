import { Permission } from '@picker-cc/common/lib/generated-types';
import { ID } from '@picker-cc/common/lib/shared-types';

import { InjectableStrategy } from '../../common/types/injectable-strategy';

/**
 * @description
 * 与当前会话关联的用户的简化表示
 *
 * @docsCategory auth
 * @docsPage SessionCacheStrategy
 */
export type CachedSessionUser = {
    id: ID;
    identifier: string;
    verified: boolean;
    permissions: Permission[]
};

/**
 * @description
 * 会话的简化表示，便于存储。
 *
 * @docsCategory auth
 * @docsPage SessionCacheStrategy
 */
export type CachedSession = {
    /**
     * @description
     * 时间戳，在此之后该缓存条目被认为是过期的，并将设置一个新的数据副本。
     * 基于 `sessionCacheTTL` 选项。
     */
    cacheExpiry: number;
    /** 用户 id */
    id: ID;
    token: string;
    expires: Date;
    authenticationStrategy?: string;
    user?: CachedSessionUser;
    // 订单
    // activeOrderId?
};

/**
 * @description
 * 这个策略定义了会话的缓存方式。由于大多数请求都需要 Session 对象来获取权限数据，
 * 因此每次访问数据库并执行多连接SQL查询都可能成为瓶颈。因此，我们缓存会话数据，在缓存失效时只执行SQL查询一次。
 *
 * @docsCategory auth
 * @docsPage SessionCacheStrategy
 * @docsWeight 0
 */
export interface SessionCacheStrategy extends InjectableStrategy {
    /**
     * @description
     * 将会话存储在缓存中。当缓存一个会话时，数据不应该被修改，除非执行任何转换来将其转换为要存储的状态，
     * 例如：JSON.stringify()
     */
    set(session: CachedSession): void | Promise<void>;

    /**
     * @description
     * 从缓存中检索会话
     */
    get(sessionToken: string): CachedSession | undefined | Promise<CachedSession | undefined>;

    /**
     * @description
     * 从缓存中删除会话
     */
    delete(sessionToken: string): void | Promise<void>;

    /**
     * @description
     * 清除整个缓存
     */
    clear(): void | Promise<void>;
}
