import {InjectableStrategy} from "../../common";

/**
 * @description
 * 定义当使用{@link NativeAuthenticationStrategy} 时如何对用户密码进行 hashed
 * @docCategory auth
 */
export interface PasswordHashingStrategy extends InjectableStrategy {
    hash(plaintext: string): Promise<string>;
    check(plaintext: string, hash: string): Promise<boolean>;
}
