/// <reference types="node" />
/**
 * 消息签名加解密类
 */
export declare class MessageCrypto {
    private static NONCESTR_MAX;
    static sha1(...args: string[]): string;
    static md5(text: string): string;
    static getAESKey(encodingAESKey: string): Buffer;
    static getAESKeyIV(aesKey: Buffer): Buffer;
    /**
     * AES算法pkcs7 padding Encoder
     * @param {Buffer} buff
     * @returns
     */
    static PKCS7Encoder(buff: Buffer): Buffer;
    /**
     * AES算法pkcs7 padding Decoder
     * @param {Buffer} buff 需要解码的Buffer
     * @returns
     */
    static PKCS7Decoder(buff: Buffer): Buffer;
    /**
     * 对给定的密文进行AES解密
     * @param {Buffer} aesKey
     * @param {Buffer} iv
     * @param {String} str
     * @returns
     */
    static decrypt(aesKey: Buffer, iv: Buffer, str: string): string;
    /**
     * 对给定的消息进行AES加密
     * @param {Buffer} aesKey
     * @param {Buffer} iv
     * @param {String} msg 需要加密的明文
     * @param {String} appId 需要对比的appId，如果第三方回调时默认是suiteId，也可自行传入作为匹配处理
     * @returns
     */
    static encrypt(aesKey: Buffer, iv: Buffer, msg: string, appId: string): string;
    /**
     * 生成随机字符串
     * @param {number} length 长度，默认16
     * @returns
     */
    static createNonceStr(length?: number): string;
    /**
     * 消息加密
     * @param {string} appId appId
     * @param {string} token 消息token
     * @param {string} encodingAESKey 消息AES KEY
     * @param {string} message 明文
     * @param {string} timestamp 时间戳
     * @param {string} nonce 随机字符串
     * @returns {string} XML格式字符串 <xml><Encrypt></Encrypt><MsgSignature></MsgSignature><TimeStamp></TimeStamp><Nonce></Nonce></xml>
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
     */
    static encryptMessage(appId: string, token: string, encodingAESKey: string, message: string, timestamp: string, nonce: string): string;
    /**
     *
     * 消息解密
     *
     * @param signature 签名
     * @param timestamp 时间戳
     * @param nonce 随机字符串
     * @param encryptXml 加密消息XML字符串
     * @returns 消息明文内容
     * @throws
     * @see MessageCrypto#encryptMessage
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
     *
     */
    /**
     * 消息解密
     * @param {string} token 消息token
     * @param {string} encodingAESKey 消息AES Key
     * @param {string} signature 消息签名
     * @param {string} timestamp 消息时间戳
     * @param {string} nonce 消息随机字符串
     * @param {string} encryptXml 消息密文
     * @returns
     * @throws
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
     */
    static decryptMessage(token: string, encodingAESKey: string, signature: string, timestamp: string, nonce: string, encryptXml: string): string;
}
