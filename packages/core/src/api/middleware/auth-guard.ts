import { IncomingMessage, ServerResponse } from 'http';
import { Permission } from '@pickerjs/common/lib/generated-types';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { ConfigService, LogLevel } from '../../config';
import { parseContext } from '../common/parse-context';
import { REQUEST_CONTEXT_KEY, RequestContextService } from '../common/request-context.service';
import { PERMISSIONS_METADATA_KEY } from '../decorators/allow.decorator';
import { ForbiddenError } from '../../common/error/errors';
import { CachedSession } from '../../config/session-cache/session-cache-strategy';
import { createSessionContext } from '../../schema/session';
import { EventBus } from '../../event-bus';
import { RequestContext } from '../common/request-context';

/**
 * @description
 * 权限守卫：
 *
 * 1. 检查请求中是否存在有效的会话令牌，如果找到则将当前的 User 实体附加到请求中。
 * 2. 强制目标处理程序（解析器、字段解析器或路由）所需的任何权限，如果这些权限不存在，则抛出一个 ForbiddenError
 */
@Injectable()
export class AuthGuard implements CanActivate {
  strategy: any;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
    // private readonly eventBus: EventBus,
    // private authService: AuthService,
    // private sessionService: SessionService,
    private requestContextService: RequestContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res, info } = parseContext(context);
    // console.log(req)
    // const req = context.switchToHttp().getRequest();
    // console.log(req)
    // const res = context.switchToHttp().getRequest();
    // console.log('is auth guard');
    // console.log((req as any)[REQUEST_CONTEXT_KEY])
    // if ((req as any)[REQUEST_CONTEXT_KEY].picker) {
    //   console.log('有 picker...')
    //
    //
    //
    //   return true
    // }
    if (Reflect.has(req, REQUEST_CONTEXT_KEY)) {
      return true;
    }
    const pickerContext = this.configService.context({
      injector: this.configService.injector,
      sessionContext: this.configService.schemaConfig.session
        ? await createSessionContext(
            this.configService.schemaConfig.session,
            req as IncomingMessage,
            res as ServerResponse,
            this.configService.context
          )
        : undefined,
      req: req as IncomingMessage
    });
    // const requestContext = await requestContextService.fromRequest(req, info, permissions, session, picker);
    // (req as any)[REQUEST_CONTEXT_KEY] = {
    //   req,
    //   picker: pickerContext
    // };
    // return context
    (req as any)[REQUEST_CONTEXT_KEY] = new RequestContext({
      req: req as any,
      picker: pickerContext
    });
    return true;
    // console.log('can activeate ....')
    // const { req, res, info } = parseContext(context);
    // // req.test = 'lalala'
    // const isFieldResolver = this.isFieldResolver(info);
    // const permissions = this.reflector.get<Permission[]>(PERMISSIONS_METADATA_KEY, context.getHandler());
    // // console.log(permissions)
    // if (isFieldResolver && !permissions) {
    //   return true;
    // }
    // // const authDisabled = this.configService.authOptions.disableAuth;
    //
    // const isPublic = Boolean(permissions) && permissions.includes(Permission.Public);
    // const hasOwnerPermission = Boolean(permissions) && permissions.includes(Permission.Owner);
    // // let requestContext: RequestContext;
    // //
    // // if (isFieldResolver) {
    // //     requestContext = (req as any)[REQUEST_CONTEXT_KEY];
    // // } else {
    // //     const session = await this.getSession(req, res, hasOwnerPermission);
    // //     requestContext = await this.requestContextService.fromRequest(req, info, permissions, session);
    // //     (req as any)[REQUEST_CONTEXT_KEY] = requestContext;
    // // }
    // // console.log('auth guard ..')
    // if ((req as any)[REQUEST_CONTEXT_KEY] !== null) {
    //   return true;
    // }
    //
    // const session = await this.getSession(req, res, hasOwnerPermission);
    // const picker = await this.configService.context({
    //   // injector: 'haha',
    //   sessionContext: this.configService.schemaConfig.session
    //     ? await createSessionContext(
    //         this.configService.schemaConfig.session,
    //         context.getArgs()[1].req,
    //         context.getArgs()[1].res,
    //         this.configService.context
    //       )
    //     : undefined,
    //   req
    //   // req: context.getArgs()[1].req
    // });
    // const requestContext = await this.requestContextService.fromRequest(req, info, permissions, session, picker);
    // (req as any)[REQUEST_CONTEXT_KEY] = requestContext;
    //
    // // this.configService.context({
    // //     sessionContext: this.configService.schemaConfig.session
    // //         ? await createSessionContext(this.configService.schemaConfig.session, req, res, this.configService.context)
    // //         : undefined,
    // //     req
    // // })
    // // console.log(requestContext)
    // // console.log(session)
    // if (!permissions || isPublic) {
    //   return true;
    // }
    // const canActivate = requestContext.isAuthorized || requestContext.authorizedAsOwnerOnly;
    // if (!canActivate) {
    //   throw new ForbiddenError(LogLevel.Verbose);
    // } else {
    //   return canActivate;
    // }
  }

  private async getSession(
    req: Request,
    res: Response,
    hasOwnerPermission: boolean
  ): Promise<CachedSession | undefined> {
    // const sessionToken = extractSessionToken(req, this.configService.authOptions.tokenMethod);
    // let serializedSession: CachedSession | undefined;
    // if (sessionToken) {
    // session = await this.authService.validateSession(authToken);
    // serializedSession = await this.sessionService.getSessionFromToken(sessionToken);
    // if (serializedSession) {
    //     return serializedSession;
    // }

    // 如果有一个 token，但它不能验证为一个会话，
    // 那么这个 token 就不在有效，应该取消设置。
    // setSessionToken({
    //     req,
    //     res,
    //     authOptions: this.configService.authOptions,
    //     rememberMe: false,
    //     sessionToken: '',
    // });
    // }

    // if (hasOwnerPermission && !serializedSession) {
    //     serializedSession = await this.sessionService.createAnonymousSession();
    //     setSessionToken({
    //         sessionToken: serializedSession.token,
    //         rememberMe: true,
    //         authOptions: this.configService.authOptions,
    //         req,
    //         res,
    //     });
    // }
    // return serializedSession;
    return null;
  }

  /**
   * 当这个守卫在FieldResolver上被调用时返回true，即不是顶级 Query 或 Mutation 解析器。
   */
  private isFieldResolver(info?: GraphQLResolveInfo): boolean {
    if (!info) {
      return false;
    }
    const parentType = info?.parentType?.name;
    return parentType !== 'Query' && parentType !== 'Mutation';
  }
}
