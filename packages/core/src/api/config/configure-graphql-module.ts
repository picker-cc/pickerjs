import type { IncomingMessage, ServerResponse } from 'http';
import type { DynamicModule } from '@nestjs/common';
import type { GraphQLSchema, ValidationContext } from 'graphql';
import { extendSchema, printSchema } from 'graphql';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo';
import type { GqlModuleOptions } from '@nestjs/graphql';
import { GraphQLModule, GraphQLTypesLoader } from '@nestjs/graphql';
import { notNullOrUndefined } from '@pickerjs/common/lib/shared-utils';
import { ModuleRef } from '@nestjs/core';
import { I18nService } from '../../i18n';
import { I18nModule } from '../../i18n/i18n.module';
import { ServiceModule } from '../../service/service.module';
import { getDynamicGraphQlModulesForPlugins } from '../../plugin/dynamic-plugin-api.module';
// import { createSessionContext } from '../../schema/session';
import { EventBus, EventBusModule } from '../../event-bus';
import { getPluginAPIExtensions } from '../../plugin/plugin-metadata';
import { ConfigModule, ConfigService } from '../../config';
import { REQUEST_CONTEXT_KEY, RequestContextService } from '../common/request-context.service';
import { RequestContext } from '../common/request-context';
import { PickerContext } from '../../schema/types';

// import {}
export interface GraphQLApiOptions {
  // apiType: 'studio' | 'admin';
  typePaths: string[];
  apiPath: string;
  debug: boolean;
  playground: boolean | any;
  // tslint:disable-next-line:ban-types
  // eslint-disable-next-line @typescript-eslint/ban-types
  resolverModule?: Function;
  validationRules?: Array<(context: ValidationContext) => any>;
}

export function configureGraphQLModule(getOptions: (configService: ConfigService) => GraphQLApiOptions): DynamicModule {
  return GraphQLModule.forRootAsync<ApolloDriverConfig>({
    driver: ApolloDriver,
    // eslint-disable-next-line max-params
    useFactory: (
      configService: ConfigService,
      eventBus: EventBus,
      requestContextService: RequestContextService
      // i18nService: I18nService,
      // idCodecService: IdCodecService,
      // typesLoader: GraphQLTypesLoader
      // customFieldRelationResolverService: CustomFieldRe
    ) => {
      return createGraphQLOptions(
        configService,
        eventBus,
        // i18nService,
        requestContextService,
        // idCodecService,
        // typesLoader,
        // customFieldRelationResolverService,
        getOptions(configService)

        // options,
      );
    },
    inject: [ConfigService, EventBus, I18nService, GraphQLTypesLoader, ModuleRef],
    imports: [
      ConfigModule,
      I18nModule,
      EventBusModule,
      // ApiSharedModule,
      ServiceModule
    ]
  });
}

// eslint-disable-next-line max-params
async function createGraphQLOptions(
  configService: ConfigService,
  eventBus: EventBus,
  // i18nService: I18nService,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requestContextService: RequestContextService,
  // idCodecService: IdCodecService,
  // typesLoader: GraphQLTypesLoader,
  options: GraphQLApiOptions
): Promise<GqlModuleOptions> {
  const builtSchema = await buildSchemaForApi(configService.graphqlSchema);
  // mergeSchemas(builtSchema, getMyGraphQLSchema(builtSchema))
  // const resolvers = generateResolvers(
  //     configService,
  // options.apiType,
  // builtSchema,
  // );
  //
  // const gqla = await graphql({schema: customSchema, source: "", contextValue:schemaContext})
  // console.log(builtSchema)
  return {
    path: `/${options.apiPath}`,
    typeDefs: printSchema(builtSchema),
    include: [options.resolverModule, ...getDynamicGraphQlModulesForPlugins()],
    fieldResolverEnhancers: ['guards'],
    // schema: configService.graphqlSchema,
    schema: builtSchema,
    // resolvers,
    uploads: false,
    playground: options.playground || false,
    debug: options.debug || false,
    // req: IncomingMessage;
    // res: ServerResponse;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: async ({ req, res }: { req: IncomingMessage; res: ServerResponse }) => {
      // if (req.context)
      //  console.log(configService.context({}).session)
      // console.log('config graphql module...')
      // const context = configService.context({
      //   eventBus,
      //   injector: configService.injector,
      //   // services,
      //   sessionContext: configService.schemaConfig.session
      //     ? await createSessionContext(configService.schemaConfig.session, req, res, configService.context)
      //     : undefined,
      //   req
      // });
      // const requestContext = await requestContextService.fromRequest(req as any, context);
      // configService.
      // 这里要返回 res、req 否则会影响 session token 的处理

      const extendContext: PickerContext = {
        ...configService.context,
        injector: configService.injector,
        res,
        req,
        eventBus
        // session: await configService.schemaConfig.session.get({})
        // session: configService.context.withRequest(req, res)
        // session: configService.schemaConfig.session
      };
      // session: await configService.context.sessionStrategy.get({  });
      // 要改写 withAuth
      extendContext.session = await configService.context.sessionStrategy.get({ context: extendContext });
      // extendContext.session = await configService.schemaConfig.session()
      // console.log(configService.schemaConfig.session)

      // if (configService.context.session) {
      //   extendContext.session = await configService.context.session.get({
      //   })
      // }
      (req as any)[REQUEST_CONTEXT_KEY] = new RequestContext({
        req: req as any,
        picker: extendContext
      });
      return extendContext;
      // return configService.context
    },
    // 这是由Express cors插件处理
    cors: false,
    plugins: [
      // new TranslateErrorsPlugin(i18nService),
      // new AssetInterceptorPlugin(configService),
      ...configService.apiOptions.apolloServerPlugins
    ],
    validationRules: options.validationRules,
    // introspection: true,
    introspection: configService.apiOptions.introspection ?? true
  } as GqlModuleOptions;

  /**
   * 组合生成服务器的 GraphQL schema
   * 1. 在 `typePaths` 指定的 source .graphql 文件中定义的默认模式
   * 2. 在配置中定义的任何自定义字段
   * 3. 由插件定义的任何模式扩展
   *
   * @param apiType
   */
  async function buildSchemaForApi(schema: GraphQLSchema): Promise<GraphQLSchema> {
    // 路径必须规范化以使用正斜杠分隔符。
    // 参考 https://github.com/nestjs/graphql/issues/336
    // const normalizedPaths = options.typePaths.map(p => p.split(path.sep).join('/'));
    // const typeDefs = await typesLoader.mergeTypesByPaths(normalizedPaths);
    // let schema = buildSchema(typeDefs);

    getPluginAPIExtensions(configService.plugins)
      .map(e => (typeof e.schema === 'function' ? e.schema() : e.schema))
      .filter(notNullOrUndefined)
      // eslint-disable-next-line no-param-reassign
      .forEach(documentNode => (schema = extendSchema(schema, documentNode)));

    // schema = generateListOptions(schema);
    // schema = generateErrorCodeEnum(schema);
    // schema = generateAuthenticationTypes(schema, authStrategies);
    // schema = generatePermissionEnum(schema, configService.authOptions.customPermissions);

    return schema;
  }
}
