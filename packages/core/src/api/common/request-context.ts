import {ID, JsonCompatible} from '@picker-cc/common/lib/shared-types';
import { isObject } from '@picker-cc/common/lib/shared-utils';
import { Request } from 'express';

import {CachedSession} from "../../config/session-cache/session-cache-strategy";
import {TFunction} from "i18next";
import {LanguageCode} from "@picker-cc/common/lib/generated-types";
import {CreateContext, PickerContext} from "../../schema/types";

export type SerializedRequestContext = {
    _req?: any;
    _session: JsonCompatible<Required<CachedSession>>;
    // _apiType: ApiType;
    _languageCode: LanguageCode;
    _isAuthorized: boolean;
    _authorizedAsOwnerOnly: boolean;
};

/**
 * @description
 * RequestContext保存着与当前请求相关的信息，这些信息可能在堆栈的各个点上都需要。
 * 将RequestContext(使用{@link Ctx}装饰器)注入到 _all_ 解析器和REST处理程序中，然后将其传递到服务层，这是一个好做法。
 *
 * 这允许服务层访问有关当前用户、活动语言、活动通道等的信息。此外，为了正确处理每个请求的数据库事务，
 *
 * {@link TransactionalConnection}依赖于RequestContext对象的存在。
 *
 * @example
 * ```TypeScript
 * \@Query()
 * myQuery(\@Ctx() ctx: RequestContext) {
 *   return this.myService.getData(ctx);
 * }
 * ```
 * @docsCategory request
 */
export class RequestContext {
    private readonly _languageCode: LanguageCode;
    private readonly _session?: CachedSession;
    private readonly _isAuthorized: boolean;
    private readonly _authorizedAsOwnerOnly: boolean;
    private readonly _translationFn: TFunction;
    // private readonly _apiType: ApiType;
    private readonly _req?: Request;
    private readonly _picker?: PickerContext

    /**
     * @internal
     */
    constructor(options: {
        req?: Request;
        session?: CachedSession;
        languageCode?: LanguageCode;
        isAuthorized: boolean;
        authorizedAsOwnerOnly: boolean;
        translationFn?: TFunction;
        picker?: PickerContext
    }) {
        const { req, session, languageCode, translationFn, picker } = options;
        this._req = req;
        // this._apiType = apiType;
        this._session = session;
        this._languageCode = languageCode;
        this._isAuthorized = options.isAuthorized;
        this._authorizedAsOwnerOnly = options.authorizedAsOwnerOnly;
        this._translationFn = translationFn || (((key: string) => key) as any);
        this._picker = picker
    }

    /**
     * @description
     * 创建一个 "empty" RequestContext对象。这只用于必须在正常的请求-响应周期之外调用服务方法的情况，
     * 例如:
     * 当以编程方式填充数据时。通常一个更好的替代方法是使用{@link RequestContextService} `create()` 方法，
     * 它允许对生成的RequestContext对象有更多的控制。
     */
    static empty(): RequestContext {
        return new RequestContext({
            // apiType: 'admin',
            authorizedAsOwnerOnly: false,
            isAuthorized: true,
        });
    }

    /**
     * @description
     * 从 `serialize()` 方法创建的序列化对象创建一个新的 RequestContext 对象
     */
    static deserialize(ctxObject: SerializedRequestContext): RequestContext {
        return new RequestContext({
            req: ctxObject._req as any,
            // apiType: ctxObject._apiType,
            session: {
                ...ctxObject._session,
                expires: ctxObject._session?.expires && new Date(ctxObject._session.expires),
            },
            isAuthorized: ctxObject._isAuthorized,
            authorizedAsOwnerOnly: ctxObject._authorizedAsOwnerOnly,
        });
    }
    /**
     * @description
     * 将 RequestContext 对象序列化为一个JSON兼容（JSON-compatible）的简单对象。
     * 当你需要将 RequestContext 对象发送给另一个进程时，这是很有用的。
     * 例如：
     * 通过 {@link JobQueueService} 将其传递给 Job Queue
     */
    serialize(): SerializedRequestContext {
        const serializableThis: any = Object.assign({}, this);
        if (this._req) {
            serializableThis._req = this.shallowCloneRequestObject(this._req);
        }
        return JSON.parse(JSON.stringify(serializableThis));
    }

/*    static fromObject(ctxObject: any): RequestContext {
        let session: Session | undefined;
        if (ctxObject._session) {
            if (ctxObject._session.user) {
                const user = new User(ctxObject._session.user);
                session = new Session({
                    ...ctxObject._session,
                    user,
                });
            } else {
                session = new Session(ctxObject._session);
            }
        }

        return new RequestContext({
            apiType: ctxObject._apiType,
            session,
            isAuthorized: ctxObject._isAuthorized,
            authorizedAsOwnerOnly: ctxObject._authorizedAsOwnerOnly,
        });
    }*/

    // get apiType(): ApiType {
    //     return this._apiType;
    // }
    //
    get session(): CachedSession | undefined {
        return this._session;
    }

    get activeUserId(): ID | undefined {
        // const user = this.activeUser;
        // if (user) {
        //     return user.id;
        // }
        return this.session?.user?.id
    }

    // get activeUser(): User | undefined {
    //     if (this.session) {
    //         if (this.isAuthenticatedSession(this.session)) {
    //             return this.session.user;
    //         }
    //     }
    // }
    //
    /**
     * @description
     * True if the current anonymous session is only authorized to operate on entities that
     * are owned by the current session.
     */
    get authorizedAsOwnerOnly(): boolean {
        return this._authorizedAsOwnerOnly;
    }

    /**
     * @description
     * 如果当前会话被授权访问当前解析器方法，则为True。
     */
    get isAuthorized(): boolean {
        return this._isAuthorized;
    }

    get picker(): PickerContext {
        return this._picker
    }

    private isAuthenticatedSession(session: any): any {
        return session.hasOwnProperty('user');
    }

    /**
     * Express "Request" 对象很大，包含许多循环引用。
     * 我们将只保留整体的一个子集，只保留高达2级的可序列化属性。
     * @private
     */
    private shallowCloneRequestObject(req: Request) {
        function copySimpleFieldsToDepth(target: any, maxDepth: number, depth: number = 0) {
            const result: any = {};
            // tslint:disable-next-line:forin
            for (const key in target) {
                if (key === 'host' && depth === 0) {
                    // avoid Express "deprecated: req.host" warning
                    continue;
                }
                let val: any;
                try {
                    val = (target as any)[key];
                } catch (e) {
                    val = String(e);
                }

                if (Array.isArray(val)) {
                    depth++;
                    result[key] = val.map(v => {
                        if (!isObject(v) && typeof val !== 'function') {
                            return v;
                        } else {
                            return copySimpleFieldsToDepth(v, maxDepth, depth);
                        }
                    });
                    depth--;
                } else if (!isObject(val) && typeof val !== 'function') {
                    result[key] = val;
                } else if (depth < maxDepth) {
                    depth++;
                    result[key] = copySimpleFieldsToDepth(val, maxDepth, depth);
                    depth--;
                }
            }
            return result;
        }

        return copySimpleFieldsToDepth(req, 1);
    }
}
