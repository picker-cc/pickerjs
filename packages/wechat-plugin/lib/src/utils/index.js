"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRid = exports.createNonceStr = void 0;
__exportStar(require("./cache"), exports);
__exportStar(require("./redis.cache"), exports);
__exportStar(require("./message-crypto"), exports);
/**
 * 指定长度随机字符串
 *
 * @param length
 * @returns
 */
function createNonceStr(length = 16) {
    length = length > 32 ? 32 : length;
    let str = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
exports.createNonceStr = createNonceStr;
/**
 * 从error message中截取rid
 * @param errMsg
 * @returns
 */
function parseRid(errMsg) {
    if (typeof errMsg !== 'string') {
        return '';
    }
    const index = errMsg.indexOf('rid:');
    if (index >= 0) {
        return errMsg.substring(index + 5);
    }
    else {
        return '';
    }
}
exports.parseRid = parseRid;
