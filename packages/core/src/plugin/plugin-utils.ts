import { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { Logger, RuntimePickerConfig, PickerConfig } from '../config';

/**
 * @description
 * 创建一个代理中间件，将给定的跌幅代理给给定的端口。
 * 使用插件启动自己的服务器，但应通过主体的 Picker url 来访问。
 *
 * @example
 * ```ts
 * // 示例：PickerPlugin 的 `configuration` 方法。
 * // 假设我们在 5678 端口上启动了一个 Node 服务器
 * // 运行一些我们想通过 `/my-plugin/` 访问的服务，要使用 Picker 服务器的主路径
 * \@PickerPlugin({
 *   configuration: (config: Required<PickerConfig>) => {
 *       config.apiOptions.middleware.push({
 *           handler: createProxyHandler({
 *               label: 'Admin UI',
 *               route: 'my-plugin',
 *               port: 5678,
 *           }),
 *           route: 'my-plugin',
 *       });
 *       return config;
 *   }
 * })
 * export class MyPlugin {}
 * ```
 *
 * @docsCategory Plugin
 * @docsPage Plugin Utilities
 */
export function createProxyHandler(options: ProxyOptions): RequestHandler {
    const route = options.route.charAt(0) === '/' ? options.route : '/' + options.route;
    const proxyHostname = options.hostname || 'localhost';
    const middleware = createProxyMiddleware({
        // TODO: how do we detect https?
        target: `http://${proxyHostname}:${options.port}`,
        pathRewrite: {
            [`^${route}`]: `/` + (options.basePath || ''),
        },
        logProvider(provider) {
            return {
                log(message: string) {
                    Logger.debug(message, options.label);
                },
                debug(message: string) {
                    Logger.debug(message, options.label);
                },
                info(message: string) {
                    Logger.debug(message, options.label);
                },
                warn(message: string) {
                    Logger.warn(message, options.label);
                },
                error(message: string) {
                    Logger.error(message, options.label);
                },
            };
        },
    });
    return middleware;
}

/**
 * @description
 * 可以通过{@link createProxyHandler} 配置代理中间件
 *
 * @docsCategory Plugin
 * @docsPage Plugin Utilities
 */
export interface ProxyOptions {
    /**
     * @description
     * 被代理的服务标签，可供人识别。用于生成信息量更大的日志。
     */
    label: string;
    /**
     * @description
     * 将作为代理 url 的 Picker 服务器的路由。
     */
    route: string;
    /**
     * @description
     * 代理服务运行的端口
     */
    port: number;
    /**
     * @description
     * 正在运行代理服务的服务器的主机名。
     *
     * @default 'localhost'
     */
    hostname?: string;
    /**
     * @description
     * 代理服务器上可选的基本路径。
     */
    basePath?: string;
}

const pluginStartupMessages: Array<{ label: string; path: string }> = [];

/**
 * 使用这个函数在 bootstrap 日志输出中添加一行由这个插件添加的服务
 */
export function registerPluginStartupMessage(serviceName: string, path: string) {
    pluginStartupMessages.push({ label: serviceName, path });
}

export function getPluginStartupMessages(): ReadonlyArray<{ label: string; path: string }> {
    return pluginStartupMessages;
}
