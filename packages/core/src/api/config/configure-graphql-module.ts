import {DynamicModule} from "@nestjs/common";
import {ConfigModule, ConfigService, PickerConfig} from "../../config";
import {buildSchema, extendSchema, graphql, GraphQLSchema, printSchema, ValidationContext} from "graphql";

import path from "path";
import {generateListOptions} from "./generate-list-options";
import {generatePermissionEnum} from "./generate-permission";
import {ApolloDriver, ApolloDriverConfig} from "@nestjs/apollo";
import {GqlModuleOptions, GraphQLModule, GraphQLTypesLoader} from "@nestjs/graphql";
import {I18nService} from '../../i18n/i18n.service';
import {I18nModule} from "../../i18n/i18n.module";
import {TranslateErrorsPlugin} from "../middleware/translate-errors-plugin";
import {generateErrorCodeEnum} from "./generate-error-code-enum";
import {generateAuthenticationTypes} from "./generate-auth-types";
import {ServiceModule} from "../../service/service.module";
import {getDynamicGraphQlModulesForPlugins, getPluginExports} from "../../plugin/dynamic-plugin-api.module";
import {IncomingMessage, ServerResponse} from "http";
import {createSessionContext} from "../../schema/session";
import {EventBus, EventBusModule} from "../../event-bus";
import {AssetInterceptorPlugin} from "../middleware/asset-interceptor-plugin";
import {getPluginAPIExtensions} from "../../plugin/plugin-metadata";
import {notNullOrUndefined} from "@picker-cc/common/lib/shared-utils";
import {ContextIdFactory, ModuleRef} from "@nestjs/core";
import {Injector} from "../../common";
import {askQuestionWithEditor} from "@changesets/cli/dist/declarations/src/utils/cli-utilities";
import {PickerContext} from "../../schema/types";
import {inject} from "prompts";

// import {}
export interface GraphQLApiOptions {
    // apiType: 'studio' | 'admin';
    typePaths: string[];
    apiPath: string;
    debug: boolean;
    playground: boolean | any;
    // tslint:disable-next-line:ban-types
    resolverModule?: Function;
    validationRules?: Array<(context: ValidationContext) => any>;
}

export function configureGraphQLModule(
    getOptions: (
        configService: ConfigService,
    ) => GraphQLApiOptions
): DynamicModule {

    return GraphQLModule.forRootAsync<ApolloDriverConfig>({
        driver: ApolloDriver,
        useFactory: (
            configService: ConfigService,
            eventBus: EventBus,
            // requestContextService: RequestContextService,
            i18nService: I18nService,
            // idCodecService: IdCodecService,
            typesLoader: GraphQLTypesLoader,
            // customFieldRelationResolverService: CustomFieldRe
        ) => {

            return createGraphQLOptions(
                configService,
                eventBus,
                i18nService,
                // requestContextService,
                // idCodecService,
                typesLoader,
                // customFieldRelationResolverService,
                getOptions(configService),

            // options,
            );
        },
        inject: [
            ConfigService,
            EventBus,
            I18nService,
            GraphQLTypesLoader,
            ModuleRef
        ],
        imports: [
            ConfigModule,
            I18nModule,
            EventBusModule,
            // ApiSharedModule,
            ServiceModule
        ],

    })
}

async function createGraphQLOptions(
    configService: ConfigService,
    eventBus: EventBus,
    i18nService: I18nService,
    // requestContextService: RequestContextService,
    // idCodecService: IdCodecService,
    typesLoader: GraphQLTypesLoader,
    options: GraphQLApiOptions,
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
        path: '/' + options.apiPath,
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
        context: async ({req, res}: {req: IncomingMessage, res: ServerResponse}) => {
            // console.log(configService.injector)
            // console.log(configService)
            // console.log(pluginExports)
            // pluginExports.map(service => {
            //     console.log(service)
            // })
            // const exports: any = getPluginExports()
            // console.log(exports)
            // const pluginServices = exports.map((services: any) => {
            //     return services.map(async (item: any) => {
            //         if (item.name === 'ScraperService') {
            //             // console.log(item.name)
            //             // await injector.resolve(item)
            //             // console.log(injector.get(item))
            //             configService.injector.get(item).print()
            //             // console.log(injector.resolve(item))
            //         }
            //         return item
            //         // console.log(injector.resolve(item))
            //     })
            // })
            // console.log(pluginServices)
            // const getService = () => {}

           // console.log('xx-x-x--x')
            // console.log(configService.injector)
            // console.log(injecttorx )
            // const injectorx = configService.injector
            //             configService.injector.get(item).print()
            // const configSrv = injectorx.get(ConfigService)
            // console.log(configSrv)
            const context = configService.context({
                eventBus,
                injector: configService.injector,
                // services,
                sessionContext: configService.schemaConfig.session
                    ? await createSessionContext(configService.schemaConfig.session, req, res, configService.context)
                    : undefined,
                req
            })

            return context
            // return configService.context
        },
        // 这是由Express cors插件处理
        cors: false,
        plugins: [
            // new TranslateErrorsPlugin(i18nService),
            // new AssetInterceptorPlugin(configService),
            ...configService.apiOptions.apolloServerPlugins,
        ],
        validationRules: options.validationRules,
        // introspection: true,
        introspection: configService.apiOptions.introspection ?? true,
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
            .forEach(documentNode => (schema = extendSchema(schema, documentNode)))

        // schema = generateListOptions(schema);
        // schema = generateErrorCodeEnum(schema);
        // schema = generateAuthenticationTypes(schema, authStrategies);
        // schema = generatePermissionEnum(schema, configService.authOptions.customPermissions);

        return schema;
    }
}
