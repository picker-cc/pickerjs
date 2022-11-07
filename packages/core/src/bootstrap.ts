import {ConfigService, DefaultLogger, Logger, PickerConfig, RuntimePickerConfig} from "./config";
import {INestApplication} from "@nestjs/common";
import {getConfig, setConfig} from "./config/config-helpers";
import cookieParser from 'cookie-parser';
import {getConfigurationFunction, getEntitiesFromPlugins} from "./plugin/plugin-metadata";
import {getPluginStartupMessages} from "./plugin/plugin-utils";
import {setProcessContext} from "./process-context/process-context";
import {NestFactory} from "@nestjs/core";
import {PickerWorker} from "./worker";
import {
    generateCommittedArtifacts,
    generateNodeModulesArtifacts,
    getSchemaPaths,
    requirePrismaClient
} from "./schema/artifacts";
import {SchemaConfig} from "./schema/types";
import {createSystem} from "./createSystem";
import {devMigrations, pushPrismaSchemaToDatabase} from "./schema/migrations";
import {initConfig} from "./schema/initConfig";
import {setPickerContext} from "./picker-context/picker-context";

/**
 * @description
 * Picker Server 引导服务，这个是应用程序的入口。
 * @example
 * ```Typescript
 * import { bootstrap } from '\@picker-cc/core';
 * import { config } from './picker-config';
 *
 * bootstrap(config).catch(err => {
 *     console.log(err);
 * });
 * ```
 *
 * @docsCategory
 */
export async function bootstrap(userConfig: Partial<PickerConfig>): Promise<INestApplication> {

    const setInitConfig = initConfig(userConfig.schemaConfig);
    const {graphQLSchema, picker} = await setInitialPicker(setInitConfig, process.cwd(), userConfig.shouldDropDatabase)
    userConfig.graphqlSchema = graphQLSchema
    userConfig.context = picker.createContext

    // 1 在系统启动前处理预置的各项配置
    const config = await preBootstrapConfig(userConfig);
    Logger.useLogger(config.logger);
    Logger.info(`引导启动 Picker Server (pid: ${process.pid})...`);

    // 只有在配置中设置了实体之后，AppModule 才 *必须* 加载，这样当 AppModule 装饰器被求值时，它们才可用。
    // tslint:disable-next-line:whitespace
    const appModule = await import('./app.module');
    // const configServ = app.get<ConfigService>(ConfigService);
    // console.log(configServ)
    // console.log(appModule)
    setProcessContext('server');
    setPickerContext(picker.createContext())
    const {hostname, port, cors, middleware} = config.apiOptions;
    DefaultLogger.hideNestBoostrapLogs();
    const app = await NestFactory.create(appModule.AppModule, {
        cors,
        logger: new Logger(),
    })
    // await preBootstrapConfig()
    // setConfig(userConfig);
    // console.log(app)

    DefaultLogger.restoreOriginalLogLevel();
    app.useLogger(new Logger());

    // const { tokenMethod } = config.authOptions;
    // const usingCookie =
    //     tokenMethod === 'cookie' || (Array.isArray(tokenMethod) && tokenMethod.includes('cookie'));
    // if (usingCookie) {
    //     const { cookieOptions } = config.authOptions;
    //     app.use(cookieSession(cookieOptions));
    // }
    app.use(cookieParser());
    const earlyMiddlewares = middleware.filter(mid => mid.beforeListen);
    earlyMiddlewares.forEach(mid => {
        app.use(mid.route, mid.handler);
    });
    await app.listen(port, hostname || '');
    app.enableShutdownHooks();
    logWelcomeMessage(config);
    return app;
}

/**
 * @description
 * 引导一个 Picker worker。解析为一个 {@link PickerWorker} 对象，该对象包含对底层的引用
 * Nestjs [独立应用程序](https://docs.nestjs.com/standalone-applications) 以及启动 job 队列和健康检查服务的便捷方法以。
 *
 * Read more about the [PickerCC Worker]({{< relref "picker-worker" >}}).
 * 阅读更多关于[Picker Worker]({{<relref "picker-worker">>}})
 *
 * @example
 * ```TypeScript
 * import { bootstrapWorker } from '\@picker-common/core';
 * import { config } from './picker-config';
 *
 * bootstrapWorker(config)
 *   .then(worker => worker.startJobQueue())
 *   .then(worker => worker.startHealthCheckServer({ port: 3020 }))
 *   .catch(err => {
 *     console.log(err);
 *   });
 * ```
 * @docsCategory worker
 * */
export async function bootstrapWorker(userConfig: Partial<PickerConfig>): Promise<PickerWorker> {

    const pickerConfig = await preBootstrapConfig(userConfig);
    const config = disableSynchronize(pickerConfig);
    if (config.logger instanceof DefaultLogger) {
        config.logger.setDefaultContext('Picker Worker');
    }
    Logger.useLogger(config.logger);
    Logger.info(`Bootstrapping Picker Worker (pid: ${process.pid})...`);

    setProcessContext('worker');
    // setPickerContext()
    DefaultLogger.hideNestBoostrapLogs();

    const WorkerModule = await import('./worker/worker.module').then(m => m.WorkerModule);
    const workerApp = await NestFactory.createApplicationContext(WorkerModule, {
        logger: new Logger(),
    });
    DefaultLogger.restoreOriginalLogLevel();
    workerApp.useLogger(new Logger());
    workerApp.enableShutdownHooks();
    // await validateDbTablesForWorker(workerApp);
    Logger.info('Picker Worker 准备好了👌');
    return new PickerWorker(workerApp);
}


/**
 *
 */
export async function preBootstrapConfig(
    userConfig: Partial<PickerConfig>
): Promise<Readonly<RuntimePickerConfig>> {
    // 1-1 配置系统的定定义配置
    if (userConfig) {
        // @ts-ignore
        setConfig(userConfig);
    }
    // 1-2 取得全部的数据实体
    // const entities = await getAllEntities(userConfig);
    // const { coreSubscribersMap } = await import('./entity/subscribers');
    // 1-3 配置数据实体取得ORM工具的系统配置
    // setConfig({
    //     dbConnectionOptions: {
    //         // @ts-ignore
    //         entities: [],
    //         discovery: {
    //             disableDynamicFileAccess: true,
    //         },
    //         // subscribers: Object.values(coreSubscribersMap) as Array<Type<EntitySubscriberInterface>>,
    //     },
    // });

    // const generate = new Promise(async () => {
    // })
    let config = getConfig();

    // 1-4 启动插件的初始化配置
    config = await runPluginConfigurations(config);
    // registerCustomEntityFields(config);
    // setExposedHeaders(config);
    return config;
}

/**
 * 初始化任何已配置的插件。
 */
async function runPluginConfigurations(config: RuntimePickerConfig): Promise<RuntimePickerConfig> {
    for (const plugin of config.plugins) {
        const configFn = getConfigurationFunction(plugin);
        if (typeof configFn === 'function') {
            config = await configFn(config);
        }
    }
    return config;
}

async function setInitialPicker(
    config: SchemaConfig,
    cwd: string,
    shouldDropDatabase: boolean
) {
    const {graphQLSchema, getPicker} = createSystem(config, true)

    // Generate the Artifacts
    console.log('✨ 生成 GraphQL 和 Prisma 的 schemas');
    const prismaSchema = (await generateCommittedArtifacts(graphQLSchema, config, cwd)).prisma
    let prismaClientGenerationPromise = generateNodeModulesArtifacts(graphQLSchema, config, cwd);
    let migrationPromise: Promise<void>;

    // Set up the Database
    if (config.db.useMigrations) {
        migrationPromise = devMigrations(
            config.db.url,
            config.db.shadowDatabaseUrl,
            prismaSchema,
            getSchemaPaths(cwd).prisma,
            shouldDropDatabase
        );
    } else {
        migrationPromise = pushPrismaSchemaToDatabase(
            config.db.url,
            config.db.shadowDatabaseUrl,
            prismaSchema,
            getSchemaPaths(cwd).prisma,
            shouldDropDatabase
        );
    }

    await Promise.all([prismaClientGenerationPromise, migrationPromise]);

    const prismaClientModule = requirePrismaClient(cwd);
    const picker = getPicker(prismaClientModule);
    // Connect to the Database
    console.log('✨ 连接到数据库');
    await picker.connect();

    return {
        graphQLSchema,
        picker
    }
}

/**
 * 返回核心实体和插件中定义的任何其他实体的数组
 * @param userConfig
 */
// export async function getAllEntities(userConfig: Partial<PickerConfig>): Promise<Array<Type<any>>> {
//
//     const coreEntities = Object.values(coreEntitiesMap) as Array<Type<any>>;
//     const pluginEntities = getEntitiesFromPlugins(userConfig.plugins);
//
//     const allEntities: Array<Type<any>> = coreEntities;
//
//     // 检查以确没有插件定义的实体名称与现有实体冲突
//     for (const pluginEntity of pluginEntities) {
//         if (allEntities.find(e => e.name === pluginEntity.name)) {
//             throw new InternalServerError(`error.entity-name-conflict`, { entityName: pluginEntity.name });
//         } else {
//             allEntities.push(pluginEntity);
//         }
//     }
//     return allEntities;
// }

/**
 * 如果使用 `bearer` tokenMethod，那么我们会自动在 CORS 选项中暴露 authTokenHeaderKey header，
 * 确保保留任何用户配置的 exposedHeaders
 */
// function setExposedHeaders(config: Readonly<PickerConfig>) {
//     const { tokenMethod } = config.authOptions;
//     const isUsingBearerToken =
//         tokenMethod === 'bearer' || (Array.isArray(tokenMethod) && tokenMethod.includes('bearer'));
//     if (isUsingBearerToken) {
//         const authTokenHeaderKey = config.authOptions.authTokenHeaderKey;
//         const corsOptions = config.apiOptions.cors;
//         if (typeof corsOptions !== 'boolean') {
//             const { exposedHeaders } = corsOptions;
//             let exposedHeadersWithAuthKey: string[];
//             if (!exposedHeaders) {
//                 exposedHeadersWithAuthKey = [authTokenHeaderKey];
//             } else if (typeof exposedHeaders === 'string') {
//                 exposedHeadersWithAuthKey = exposedHeaders
//                     .split(',')
//                     .map(x => x.trim())
//                     .concat(authTokenHeaderKey);
//             } else {
//                 exposedHeadersWithAuthKey = exposedHeaders.concat(authTokenHeaderKey);
//             }
//             corsOptions.exposedHeaders = exposedHeadersWithAuthKey;
//         }
//     }
// }

function logWelcomeMessage(config: RuntimePickerConfig) {
    let version: string;
    try {
        version = require('../package.json').version;
    } catch (e) {
        version = ' unknown';
    }
    const {port, appApiPath, hostname} = config.apiOptions;
    const apiCliGreetings: Array<readonly [string, string]> = [];
    const pathToUrl = (path: string) => `http://${hostname || 'localhost'}:${port}/${path}`;
    apiCliGreetings.push(['APP API', pathToUrl(appApiPath)]);
    apiCliGreetings.push(
        ...getPluginStartupMessages().map(({label, path}) => [label, pathToUrl(path)] as const)
    );
    const columnarGreetings = arrangeCliGreetingsInColumns(apiCliGreetings);
    const title = `Picker server (v${version}) 现在启动在端口： ${port}`;
    const maxLineLength = Math.max(title.length, ...columnarGreetings.map(l => l.length));
    const titlePadLength = title.length < maxLineLength ? Math.floor((maxLineLength - title.length) / 2) : 0;
    Logger.info(`=`.repeat(maxLineLength));
    Logger.info(title.padStart(title.length + titlePadLength));
    Logger.info('-'.repeat(maxLineLength).padStart(titlePadLength));
    columnarGreetings.forEach(line => Logger.info(line));
    Logger.info(`=`.repeat(maxLineLength));
}

function arrangeCliGreetingsInColumns(lines: Array<readonly [string, string]>): string[] {
    const columnWidth = Math.max(...lines.map(l => l[0].length)) + 2;
    return lines.map(l => `${(l[0] + ':').padEnd(columnWidth)}${l[1]}`);
}

/**
 * 修正了修改DB时的竞争条件
 */
function disableSynchronize(userConfig: Readonly<RuntimePickerConfig>): Readonly<RuntimePickerConfig> {
    const config = {...userConfig};
    // config.dbConnectionOptions = {
    //     ...userConfig.dbConnectionOptions,
    //     synchronize: false,
    // } as ConnectionOptions;
    return config;
}
