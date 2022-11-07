import { DocumentNode } from 'graphql';
import {InjectableStrategy} from "../../common/types/injectable-strategy";
import {RequestContext} from "../../api/common/request-context";

/**
 * @description
 * AuthenticationStrategy 定义了如何对用户进行身份验证
 *
 * 实例：[Authentication 指南](/docs/developer-guide/authentication)
 *
 * @docsCategory auth
 */
export interface AuthenticationStrategy<Data = unknown> extends InjectableStrategy {
  /**
   * @description
   * 策略的名称, for example `'facebook'`, `'google'`, `'keycloak'`, `'github'`, `'wechat'`.
   */
  readonly name: string;

  /**
   * @description
   * 定义 `authenticate` mutation 所期望的 GraphQL Input 对象的类型。
   * 最终的输入对象将是一个映射，键是策略的名称，输入对象的结构应该匹配泛型`Data`类型参数
   *
   * @example
   * 例如：
   *
   * ```typescript
   * defineInputType() {
   *   return gql`
   *      input MyAuthInput {
   *        token: String!
   *      }
   *   `;
   * }
   * ```
   *
   * 假设策略名是"my_auth"，那么对`authenticate`的调用如下所示:
   *
   * ```graphql
   * authenticate(input: {
   *   my_auth: {
   *     token: "foo"
   *   }
   * }) {
   *   # ...
   * }
   * ```
   *
   * **注意：**如果定义了多个 graphql `input` 类型（在一个嵌套输入类型中)，那么 _first_ 输入将被假定为顶级输入
   */
  defineInputType(): DocumentNode;

  /**
   * @description
   * 用于使用 authentication provider 进行身份验证。此方法将实现特定于提供者的身份验证逻辑，并应解析为
   * 成功时使用{@link User}对象，失败时使用 `false | string`。返回 `string` 可以用来描述发生了什么错误，
   * 否则为未知错误返回 `false`。
   */
  authenticate(ctx: RequestContext, data: Data): Promise<false | string>;

  /**
   * @description
   * 在用户登出时调用，可以执行与用户登出外部提供程序相关的任何必需任务
   */
  onLogOut?(ctx: RequestContext, user: any): Promise<void>;
}

