import { PasswordHashingStrategy } from './password-hashing-strategy';
// import bcryptjs from 'bcryptjs'
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 12;

/**
 * @description
 * 使用 bcrypt (https://en.wikipedia.org/wiki/Bcrypt) 来散列明文密码字符串的哈希策略。
 *
 * @docsCategory auth
 */
export class BcryptPasswordHashingStrategy implements PasswordHashingStrategy {
    // private bcrypt: any;

    // constructor() {
        // bcrypt 库是惰性加载的，因此如果我们想在不支持本地 Node 模块的环境中运行 Picker (例如 Stackblitz 这样的在线IDE），
        // 在启动时链接源文件时，bcrypt 依赖项不会被加载
        // this.bcrypt = require('../../node_modules/@types/bcrypt');
    // }

    hash(plaintext: string): Promise<string> {
        return bcrypt.hash(plaintext, SALT_ROUNDS);
    }

    check(plaintext: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plaintext, hash);
    }
}
