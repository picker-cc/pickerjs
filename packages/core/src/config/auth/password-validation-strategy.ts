import { RequestContext } from '../../api/index';
import { InjectableStrategy } from '../../common/types/injectable-strategy';

/**
 * @description
 * 定义要应用于新密码的验证(在创建帐户或更新现有帐户时) 使用{@link NativeAuthenticationStrategy}时的密码。
 *
 * @docsCategory auth
 */
export interface PasswordValidationStrategy extends InjectableStrategy {
    /**
     * @description
     *
     * 验证在账户注册期间或客户更新密码时提交的密码。
     * 如果密码是可接受的，该该当解析为 `true`。如果不是，它将返回 `false`或一个可选的字符串，
     * 它将被传递给返回的 ErrorResult 结果中，例如：
     * 返回什么是正确的、密码无效的
     */
    validate(ctx: RequestContext, password: string): Promise<boolean | string> | boolean | string;
}
