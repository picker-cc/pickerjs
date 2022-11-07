/**
 * @description
 * 该接口定义了设置和拆卸钩子可用的各种策略用于配置 Picker。
 *
 * @docsCategory common
 */
import { Injector } from '../injector';

export interface InjectableStrategy {
  /**
   * @description
   * 定义在应用程序引导期间运行的安装逻辑。接收{@link Injector}作为参数，它允许应用程序提供者作为设置的一部分使用。
   * 这个钩子将同时在主服务器和工作进程上被调用。如果你的代码应该只在worker的服务器上运行，那么注入{@link ProcessContext}来检查当前上下文。
   *
   * @example
   * ```typescript
   * async init(injector: Injector) {
   *   const processContext = injector.get(ProcessContext);
   *   if (processContext.isServer) {
   *     const myService = injector.get(MyService);
   *     await myService.doSomething();
   *   }
   * }
   * ```
   */
  init?: (injector: Injector) => void | Promise<void>;

  /**
   * @description
   * Defines teardown logic to be run before application shutdown.
   */
  destroy?: () => void | Promise<void>;
}
