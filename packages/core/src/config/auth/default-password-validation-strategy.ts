import { RequestContext } from '../../api/index';

import { PasswordValidationStrategy } from './password-validation-strategy';

/**
 * @description
 * DefaultPasswordValidationStrategy 允许您指定最小长度和/或匹配密码的正则表达式。
 *
 * TODO:
 * 默认情况下，`minLength` 将被设置为 `4`。这是相当宽容的，这样做是为了减少向后
 * 兼容中断的风险。
 *
 * @docsCategory auth
 */
export class DefaultPasswordValidationStrategy implements PasswordValidationStrategy {
    constructor(private options: { minLength?: number; regexp?: RegExp }) {}

    validate(ctx: RequestContext, password: string): boolean | string {
        const { minLength, regexp } = this.options;
        if (minLength != null) {
            if (password.length < minLength) {
                return false;
            }
        }
        if (regexp != null) {
            if (!regexp.test(password)) {
                return false;
            }
        }
        return true;
    }
}
