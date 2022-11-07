import { Module, Provider, Type as NestType } from '@nestjs/common';
import {MODULE_METADATA} from "@nestjs/common/constants";
import {ModuleMetadata} from "@nestjs/common/interfaces";
import {APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE} from "@nestjs/core";
import {Type} from "@picker-cc/common/lib/shared-types";
import {DocumentNode} from "graphql";

import {RuntimePickerConfig} from "../config";

import {PLUGIN_METADATA} from "./plugin-metadata";
import {pick} from "@picker-cc/common/lib/pick";

/**
 * @description
 * 定义 Picker 插件的元数据。这个接口是 [Nestjs ModuleMetadata](https://docs.nestjs.com/modules)
 * （它允许定义 `imports`，`exports`，`providers`和`controllers`）的一个超集，这意味着任何 Nestjs 模块
 * 都是一个有效的 Picker 插件。此外，PickerPluginMetadata 允许定义特定于 Picker 的额外属性。
 *
 * @docsCategory plugin
 * @docsPage PickerPluginMetadata
 */
export interface PickerPluginMetadata extends ModuleMetadata {
    /**
     * @description
     * 一个可以在服务器引导之前修改 {@link PickerConfig} 对象的函数
     */
    configuration?: PluginConfigurationFn;
    /**
     * @description
     * 插件可以通过提供扩展的模式定义和任何必需的解析器来扩展默认的 Picker GraphQL 管理 api。
     */
    apiExtensions?: APIExtensionDefinition;

    /**
     * @description
     * 插件可以定义自定义的 entities
     */
    entities?: Array<Type<any>> | (() => Array<Type<any>>);
}

/**
 * @description
 * 一个允许插件扩展 Picker GraphQL API 的对象
 *
 * @docCategory plugin
 * @docsPage PickerPluginMetadata
 */
export interface APIExtensionDefinition {
    /**
     * @description
     * Schema 扩展
     *
     * @example
     * ```Typescript
     * const schema = gql`extend type SearchReindexResponse {
     *      timeTaken: Int!
     *      indexedItemCount: Int!
     * }`;
     */
    schema?: DocumentNode | (() => DocumentNode | undefined);

    /**
     * @description
     * Schema 扩展的解析器数组。应该被定义为 [Nestjs GraphQL解析器](https://docs.nextjs.com/graphql/resolvers-map) 类，
     * 即使用 Nest `\@Resolver()` 装饰器等。
     */
    resolvers: Array<Type<any>> | (() => Array<Type<any>>);
}

/**
 * @description
 * 这个方法在应用启动之前被调用，应该主被用来对 {@link PickerConfig } 执行任何需要的修改
 * @docsCategory plugin
 * @docsPage PickerPluginMetadata
 */
export type PluginConfigurationFn = (
    config: RuntimePickerConfig,
) => RuntimePickerConfig | Promise<RuntimePickerConfig>;

/**
 * @description
 * PickerPlugin 装饰器是一种配置 和/或 扩展 Picker 服务器功能的方法。
 * Picker 插件是一个 [Nestjs Module](https://docs.nestjs.com/modules)，带有可选的附加元数据，
 * 定义诸如 GraphQL API 扩展之类的东西，自定义配置或新的数据库实体。
 *
 * 除了配置应用程序，插件还可以通过扩展现有类型或添加全新的类型。
 * 还可以定义数据库实体和解析器来处理扩展的 GraphQL schema。
 *
 * @example
 * typescript
 * import { Controller, Get } from '\@nestjs/common';
 * import { Ctx, PluginCommonModule, ProductService, RequestContext, PickerPlugin } from '\@picker-cc/core';
 *
 * \@Controller('products')
 * export class ProductsController {
 *     constructor(private productService: ProductService) {}
 *
 *     \@Get()
 *     findAll(\@Ctx() ctx: RequestContext) {
 *         return this.productService.findAll(ctx);
 *     }
 * }
 *
 *
 * //添加用于查询产品的 REST endpoint 的简单插件。
 * \@PickerPlugin({
 *     imports: [PluginCommonModule],
 *     controllers: [ProductsController],
 * })
 * export class RestPlugin {}
 * ```
 *
 * @docsCategory plugin
 */
export function PickerPlugin(pluginMetadata: PickerPluginMetadata): ClassDecorator {
    // tslint:disable-next-line:ban-types
    return (target: Function) => {
        for (const metadataProperty of Object.values(PLUGIN_METADATA)) {
            // metadataProperty keyof "configuration" | "adminApiExtensions"
            const property = metadataProperty as keyof PickerPluginMetadata;
            if (pluginMetadata[property] != null) {
                Reflect.defineMetadata(property, pluginMetadata[property], target);
            }
        }

        const nestModuleMetadata = pick(pluginMetadata, Object.values(MODULE_METADATA) as any);
        //自动添加任何插件的"providers"到"exports"数组这样做是
        // 因为当一个插件定义GraphQL解析器时，这些解析器是动态使用的
        //在ApiModule中创建一个新的模块，如果这些解析器依赖于任何提供商，
        //必须导出。参见函数{@link createDynamicGraphQlModulesForPlugins}
        //实现。
        const nestGlobalProviderTokens = [APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE];
        const exportedProviders = (nestModuleMetadata.providers || []).filter(provider => {
            if (isNamedProvider(provider)) {
                if (nestGlobalProviderTokens.includes(provider.provide as any)) {
                    return false;
                }
            }
            return true;
        });
        nestModuleMetadata.exports = [...(nestModuleMetadata.exports || []), ...exportedProviders];
        Module(nestModuleMetadata)(target);
    }
}

function isNamedProvider(provider: Provider): provider is Exclude<Provider, NestType<any>> {
    return provider.hasOwnProperty('provide');
}
