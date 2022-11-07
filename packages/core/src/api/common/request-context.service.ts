import * as _ from 'lodash';
import {LanguageCode, Permission} from '@picker-cc/common/lib/generated-types';
import {Injectable} from '@nestjs/common';
import {Request} from 'express';
import {GraphQLResolveInfo} from 'graphql';

// import {ApiType, getApiType} from './get-api-type';
import {RequestContext} from './request-context';
import {CachedSession, CachedSessionUser} from "../../config/session-cache/session-cache-strategy";
import {ID} from "@picker-cc/common/lib/shared-types";
import ms from "ms";
import {CreateContext, PickerContext} from "../../schema/types";

export const REQUEST_CONTEXT_KEY = 'pickerRequestContext';

/**
 * 创建一个新的 RequestContext 实例
 */
@Injectable()
export class RequestContextService {
    constructor(
        // private casbinService: CasbinService
        // private readonly authzService: AuthZRBACService,
    ) {
    }

    /**
     * @description
     * Creates a RequestContext based on the config provided. This can be useful when interacting
     * with services outside the request-response cycle, for example in stand-alone scripts or in
     * worker jobs.
     * 根据提供的配置创建一个 RequestContext，这在与请求-响应周期之外的服务交互时很有用，
     * 例如在独立脚本或 worker jobs中
     *
     */
    async create(config: {
        req?: Request;
        // apiType?: ApiType;
        // languageCode?: LanguageCode;
        user?: any;
        activeOrderId?: ID;
    }): Promise<RequestContext> {
        const {req, user, activeOrderId} = config;

        let session: CachedSession | undefined;
        if (user) {
            // const permission = user.roles ?
            session = {
                user: {
                    id: user.id,
                    identifier: user.identifier,
                    verified: user.verified,
                    permissions: []
                    // permissions: user.roles ? getUserPermissions(user) : []
                },
                id: '__dummy_session_id__',
                token: '__dummy_session_token__',
                expires: new Date(Date.now() + ms('1y')),
                cacheExpiry: ms('1y'),
            };
        }
        return new RequestContext({
            req,
            // apiType,
            // languageCode,
            session,
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
        });
    }

    /**
     * @description
     * 基于一个 Express 请求对象创建一个新的 RequestContext。
     * 这是由 AuthGuard 在 API 层内部使用的，并创建 RequestContext，
     * 然后传递给所有 resolvers & controllers。
     * @param req
     * @param info
     * @param requiredPermissions
     * @param session
     */
    async fromRequest(
        req: Request,
        info?: GraphQLResolveInfo,
        requiredPermissions?: Permission[],
        session?: CachedSession,
        picker?: PickerContext
    ): Promise<RequestContext> {
        // const apiType = getApiType(info);
        const hasOwnerPermission = !!requiredPermissions && requiredPermissions.includes(Permission.Owner);
        const user = session && session.user;
        const permissions = user && user.permissions

        if (permissions) {
            // 交集处理
            _.intersection(_.flatten(permissions), requiredPermissions);
        }

        const isAuthorized = (() => {
            if (!permissions) {
                return false;
            }
            const intersection = _.intersection(_.flatten(permissions), requiredPermissions);
            return intersection.length > 0;
        })();
        const authorizedAsOwnerOnly = user && hasOwnerPermission;
        const translationFn = (req as any).t;

        return new RequestContext({
            req,
            // apiType,
            // user,
            session,
            isAuthorized,
            authorizedAsOwnerOnly,
            picker,
            // picker:
        });
    }
}
