import { Type } from '@nestjs/common';
import { ContextId, ModuleRef } from '@nestjs/core';

/**
 * @description
 * 注入器封装了底层的 Nestjs `ModuleRef`，允许注入应用依赖注入容器中已知的 providers。
 * 这是为了允许将服务注入到存在于 Nestjs 模块系统之外的对象中，
 * 例如可以在 PickerConfig 中提供的各种策略。
 *
 * @docsCategory common
 */
export class Injector {
    constructor(private moduleRef: ModuleRef) {}

    /**
     * @description
     * 从应用的依赖注入容器中获取一个给定类型的实例，
     * 包装 Nestjs 的 `ModuleRef.get()` 方法。
     */
    get<T, R = T>(typeOrToken: Type<T> | string | symbol): R {
        return this.moduleRef.get(typeOrToken, { strict: false });
    }

    /**
     * @description
     * 从应用的依赖注入容器中获取给定作用域的 provider 实例（transient 或 request-scoped）
     * 包装 Nestjs `ModuleRef.resolve()` 方法。
     */
    resolve<T, R = T>(typeOrToken: Type<T> | string | symbol, contextId?: ContextId): Promise<R> {
        return this.moduleRef.resolve(typeOrToken, contextId, { strict: false });
    }
}
