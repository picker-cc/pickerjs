export * from './cache';
export * from './redis.cache';
export * from './message-crypto';
/**
 * 指定长度随机字符串
 *
 * @param length
 * @returns
 */
export declare function createNonceStr(length?: number): string;
/**
 * 从error message中截取rid
 * @param errMsg
 * @returns
 */
export declare function parseRid(errMsg: string): string;
