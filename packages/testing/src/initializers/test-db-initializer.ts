import { Options } from '@mikro-orm/core';

/**
 * @description
 * Defines how the e2e TestService sets up a particular DB to run a single test suite.
 * The `\@vendure/testing` package ships with initializers for sql.js, MySQL & Postgres.
 *
 * Custom initializers can be created by implementing this interface and registering
 * it with the {@link registerInitializer} function:
 *
 * @example
 * ```TypeScript
 * export class CockroachDbInitializer implements TestDbInitializer<CockroachConnectionOptions> {
 *     // database-specific implementation goes here
 * }
 *
 * registerInitializer('cockroachdb', new CockroachDbInitializer());
 * ```
 *
 * @docsCategory testing
 */
export interface TestDbInitializer<T extends Options> {
    /**
     * @description
     * 负责为当前测试套件创建数据库。通常此方法将：
     *
     * * 使用 testFileName 参数派生数据库名称
     * * 创建一个数据库
     * * 修改 `connectionOptions` 对象以指向新的数据库
     */
    init(testFileName: string, connectionOptions: T): Promise<T>;

    /**
     * @description
     * 执行 populateFn 来填充数据库。
     */
    populate(populateFn: () => Promise<void>): Promise<void>;

    /**
     * @description
     * 清理init()阶段使用的所有资源(即关闭打开的DB连接)
     */
    destroy(): void | Promise<void>;
}
