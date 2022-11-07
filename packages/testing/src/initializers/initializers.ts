import { Options } from '@mikro-orm/core';

import { TestDbInitializer } from './test-db-initializer';

export type InitializerRegistry = { [type in Options['type']]?: TestDbInitializer<any> };

const initializerRegistry: InitializerRegistry = {};

/**
 * @description
 * 为给定的数据库类型注册一个 {@link TestDbInitializer}。
 * 应该在调用前调用{@link create TestEnvironment}。
 *
 * @docsCategory testing
 */
export function registerInitializer(type: Options['type'], initializer: TestDbInitializer<any>) {
    initializerRegistry[type] = initializer;
}

export function getInitializerFor(type: Options['type']): TestDbInitializer<any> {
    const initializer = initializerRegistry[type];
    if (!initializer) {
        throw new Error(`没有为此 "${type}" 类型数据库初始化`);
    }
    return initializer;
}
