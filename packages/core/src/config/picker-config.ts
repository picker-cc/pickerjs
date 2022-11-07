import {DynamicModule, Type} from '@nestjs/common';
import {CorsOptions} from '@nestjs/common/interfaces/external/cors-options.interface';
import {PluginDefinition} from 'apollo-server-core';
import {PickerLogger} from './logger/picker-logger';
import {Injector, Middleware} from "../common";
import {GraphQLSchema, ValidationContext} from 'graphql';
import {CreateContext, PickerContext, SchemaConfig} from "../schema/types";
import {AssetNamingStrategy} from './asset-naming-strategy/asset-naming-strategy';
import {AssetPreviewStrategy} from './asset-preview-strategy/asset-preview-strategy';
import {AssetStorageStrategy} from './asset-storage-strategy/asset-storage-strategy';
/**
 * @description
 * ApiOptions定义了如何公开的Picker GraphQL API，以及允许API层与中间件扩展。
 *
 * @docsCategory configuration
 */
export interface ApiOptions {
    /**
     * @description
     * 设置服务器主机名。如果没有设置，则使用 localhost
     *
     * @default ''
     */
    hostname?: string;
    /**
     * @description
     * Picker服务器应该监听哪个端口。
     *
     * @default 3000
     */
    port: number;
    /**
     * @description
     * Admin GraphQL API 的路径。
     * @default 'admin-api'
     */
    appApiPath?: string;

    /**
     * @description
     * 是否开启 Studio GraphQL API playground
     * [ApolloServer playground](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructoroptions-apolloserver).
     *
     * @default false
     */
    appApiPlayground?: boolean | any;

    /**
     * @description
     * 是否开启 Admin GraphQL API Debug
     * [ApolloServer playground](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructoroptions-apolloserver).
     *
     * @default false
     */
    appApiDebug?: boolean;


    /**
     * @description
     * 是否开启Server CORS 跨域。
     * 详见：[express CORS docs](https://github.com/expressjs/cors#configuration-options)
     */
    cors?: boolean | CorsOptions;
    /**
     * @description
     * 自定义的Express 或 NestJS 中间件
     *
     * @default []
     */
    middleware?: Middleware[];
    /**
     * @description
     * 自定义[ApolloServerPlugins](https://www.apollographql.com/docs/apollo-server/integrations/plugins/)，
     * 它允许 Apollo 服务器的扩展，这是底层的GraphQL服务器由Picker使用。
     ＊
     * Apollo插件可以用于对输入操作或输出数据执行自定义数据转换。
     *
     * @default []
     */
    apolloServerPlugins?: PluginDefinition[];

    /**
     * 控制是否启用GraphQL api的自检。对于生产环境，建议禁用
     * 自省，因为暴露整个模式可以让攻击者轻松地了解所有操作
     * 并且更容易找到任何潜在的可利用查询。
     *
     * **注意:**当内省被禁用时，工具依赖于它的事情，如自动完成将不会工作。
     * @example
     * ```TypeScript
     * {
     *   introspection: process.env.NODE_ENV !== 'studioion'
     * }
     * ```
     *
     * @default true
     */
    introspection?: boolean;
}
/**
 * @description
 * AssetOptions 定义资产（图像和其他文件）如何命名和存储，以及预览图像如何生成。
 *
 * **注意**: 如果你正在使用 `AssetServerPlugin`，无需配置这些选项。
 *
 * @docsCategory assets
 * */
export interface AssetOptions {
    /**
     * @description
     * 定义在保存资产文和预览图像之前如何命名。
     * @default DefaultAssetNamingStrategy
     */
    assetNamingStrategy: AssetNamingStrategy;
    /**
     * @description
     * 定义存储上传二进制文件的策略。
     * @default NoAssetStorageStrategy
     */
    assetStorageStrategy: AssetStorageStrategy;
    /**
     * @description
     * 定义用于创建上传资产的预图像的策略。
     * @default NoAssetPreviewStrategy
     */
    assetPreviewStrategy: AssetPreviewStrategy;
    /**
     * @description
     * i.e. either a file extension (".pdf") or a mime type ("image/*", "audio/mpeg" etc.).
     * 允许作为资产上传的文件类型的数组。每个条目都应该是有效的
     *  [唯一的文件类型说明符](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Unique_file_type_specifiers)
     *  即文件扩展名(".pdf") 或一个 mime 类型 ("image/*", "audio/mpeg" 等)
     *
     * @default image, audio, video MIME types plus PDFs
     */
    permittedFileTypes?: string[];
    /**
     * @description
     * 上传资产的最大文件大小（字节）
     * @default 20971520
     */
    uploadMaxFileSize?: number;
}
export interface PickerConfig {
    /**
     * 是否启动时删除数据库
     * - 可以在开发模式中配置为 true，生产模式中不建议
     */
    shouldDropDatabase: boolean;
    schemaConfig: SchemaConfig;
    context?: CreateContext;
    graphqlSchema?: GraphQLSchema;
    /**
     * 配置 APIs，包含 hostname, port, CORS 设置
     */
    apiOptions: ApiOptions;
    /**
     * @description
     * 处理资产的配置
     */
    assetOptions?: AssetOptions;

    /**
     * @description
     * An array of plugins.
     *
     * @default []
     */
    plugins?: Array<DynamicModule | Type<any>>;

    /**
     * @description
     * 提供一个 {@link PickerLogger} 的接口实现类
     *
     * @default DefaultLogger
     */
    logger?: PickerLogger;

    /**
     * @description
     * 配置如何持久化和处理作业队列
     */
    // jobQueueOptions?: JobQueueOptions;
}

/**
 * @description
 * 该接口表示在运行时可用的 PickerConfig 对象，即用户提供的对象
 * 配置值已经与{@link defaultConfig}值合并。
 *
 * @docsCategory configuration
 * @docsPage Configuration
 */
export interface RuntimePickerConfig extends Required<PickerConfig> {
    context: CreateContext;
    apiOptions: Required<ApiOptions>;
}

type DeepPartialSimple<T> = {
    [P in keyof T]?:
    | null
    | (T[P] extends Array<infer U>
    ? Array<DeepPartialSimple<U>>
    : T[P] extends ReadonlyArray<infer X>
        ? ReadonlyArray<DeepPartialSimple<X>>
        : T[P] extends Type<any>
            ? T[P]
            : DeepPartialSimple<T[P]>);
};

export type PartialPickerConfig = DeepPartialSimple<PickerConfig>;

