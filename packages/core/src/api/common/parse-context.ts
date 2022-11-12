import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLResolveInfo } from 'graphql';
import { InternalServerError } from '../../common';

export interface RestContext {
  req: Request;
  res: Response;
  isGraphQL: false;
  info: undefined;
}
export interface GraphQLContext {
  req: Request;
  res: Response;
  isGraphQL: true;
  info: GraphQLResolveInfo;
}

/**
 * Parses in the Nest ExecutionContext of the incoming request, accounting for both
 * GraphQL & REST requests.
 * 解析传入请求的Nest ExecutionContext，包含GraphQL和REST请求。
 */
export function parseContext(context: ExecutionContext | ArgumentsHost): RestContext | GraphQLContext {
  // eslint-disable-next-line no-warning-comments
  // TODO: Remove this check once this issue is resolved: https://github.com/nestjs/graphql/pull/1469
  if ((context as ExecutionContext).getHandler?.()?.name === '__resolveType') {
    return {
      req: context.getArgs()[1].req,
      res: context.getArgs()[1].res,
      isGraphQL: false,
      info: undefined
    };
  }

  if (context.getType() === 'http') {
    const httpContext = context.switchToHttp();
    return {
      isGraphQL: false,
      req: httpContext.getRequest(),
      res: httpContext.getResponse(),
      info: undefined
    };
  } else if (context.getType<GqlContextType>() === 'graphql') {
    const gqlContext = GqlExecutionContext.create(context as ExecutionContext);
    return {
      isGraphQL: true,
      req: gqlContext.getContext().req,
      res: gqlContext.getContext().res,
      info: gqlContext.getInfo()
    };
  }
  throw new InternalServerError(`Context "${context.getType()}" is not supported.`);

  // const graphQlContext = GqlExecutionContext.create(context as ExecutionContext);
  // const restContext = GqlExecutionContext.create(context as ExecutionContext);
  // const info = graphQlContext.getInfo();
  // let req: Request;
  // let res: Response;
  // if (info) {
  //     const ctx = graphQlContext.getContext();
  //     req = ctx.req;
  //     res = ctx.res;
  // } else {
  //     req = context.switchToHttp().getRequest();
  //     res = context.switchToHttp().getResponse();
  // }
  // return {
  //     req,
  //     res,
  //     info,
  //     isGraphQL: !!info,
  // };
}
