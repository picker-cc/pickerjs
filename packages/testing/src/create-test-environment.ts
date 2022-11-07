import { SimpleGraphQLClient } from './simple-graphql-client';
import { TestServer } from './test-server';
import {PickerConfig} from "@picker-cc/core";

/**
 * @description
 * {@link createTestEnvironment} 的返回值，包含测试服务器和管理API客户端
 *
 * @docsCategory testing
 */
export interface TestEnvironment {
    /**
     * @description
     * 可以针对其发出 GraphQL 请求的 Picker 服务器实例。
     */
    server: TestServer;
    /**
     * @description
     * 为 Admin API 配置的 GraphQL 客户端。
     */
    adminClient: SimpleGraphQLClient;
}

/**
 * @description
 * 为每个 GraphQL api 配置{@link TestServer} 和 {@link SimpleGraphQLClient} 端到端测试
 * 返回一个 {@link TestEnvironment} 对象
 *
 * @example
 * ```TypeScript
 * import { createTestEnvironment, testConfig } from '\@picker-cc/testing';
 *
 * describe('some feature to test', () => {
 *
 *   const { server, adminClient, shopClient } = createTestEnvironment(testConfig);
 *
 *   beforeAll(async () => {
 *     await server.init({
 *         // ... server options
 *     });
 *     await adminClient.asSuperAdmin();
 *   });
 *
 *   afterAll(async () => {
 *       await server.destroy();
 *   });
 *
 *   // ... end-to-end tests here
 * });
 * ```
 * @docsCategory testing
 */
export function createTestEnvironment(config: Required<PickerConfig>): TestEnvironment {
    const server = new TestServer(config);
    const { port, adminApiPath } = config.apiOptions;
    const adminClient = new SimpleGraphQLClient(config, `http://localhost:${port}/${adminApiPath}`);
    return {
        server,
        adminClient,
    };
}
