import { MiniProgramService } from '../miniprogram/miniprogram.service';
import { ICache } from '../types/utils';
import { WePayService } from '../wepay/wepay.service';
import { DefaultRequestResult, FollowerResult, TemplateMessage, TicketResult, UserAccessTokenResult, UserInfoResult } from "../interfaces";
import { AccountAccessTokenResult, SignatureResult, WeChatModuleOptions } from '../types';
export declare class WeChatService {
    private options;
    private static updateRemarkUrl;
    private static getUserUrl;
    private static getUserInfoUrl;
    private static batchGetUrl;
    private static getBlackListUrl;
    private static batchBlackListUrl;
    private static batchUnBlackListUrl;
    /**
     * key_access_token
     * @static
     * @memberof WeChatService
     */
    static KEY_ACCESS_TOKEN: string;
    /**
     * key_ticket
     * @static
     * @memberof WeChatService
     */
    static KEY_TICKET: string;
    protected _cacheAdapter: ICache;
    /**
     * MiniProgram Service Namespace
     *
     * @type {MiniProgramService}
     * @memberof WeChatService
     */
    mp: MiniProgramService;
    /**
     * WePay Service Namespace
     * @type {WePayService}
     * @memberof WeChatService
     */
    pay: WePayService;
    set cacheAdapter(adapter: ICache);
    get cacheAdapter(): ICache;
    constructor(options: WeChatModuleOptions);
    /**
     *
     * @deprecated
     * @memberof WeChatService
     */
    get config(): WeChatModuleOptions;
    /**
     * @deprecated
     * @memberof WeChatService
     */
    set config(options: WeChatModuleOptions);
    /**
     *
     * 获取公众号或者小程序Access token
     *
     * 正确返回
     *
     * {"access_token": "52_s0Mcl3E3DBKs12rthjxG8_DOvsIC4puV9A34WQR6Bhb_30TW9W9BjhUxDRkyph-hY9Ab2QS03Q8wZBe5UkA1k0q0hc17eUDZ7vAWItl4iahnhq_57dCoKc1dQ3AfiHUKGCCMJ2NcQ0BmbBRIKBEgAAAPGJ", "expires_in": 7200}
     *
     * 错误返回
     * {"errcode":40013,"errmsg":"invalid appid"}
     *
     * @param _appId
     * @param _secret
     * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
     * @returns
     */
    getAccountAccessToken(_appId?: string, _secret?: string): Promise<AccountAccessTokenResult>;
    /**
     * 读取access token的逻辑封装
     *
     * @param _appId
     * @param _secret
     * @returns
     */
    private getToken;
    /**
     *
     * 读取JS-SDK Ticket逻辑封装
     *
     * @param _appId
     * @param _secret
     * @returns
     */
    private getTicket;
    /**
     *
     * 获取jsapi_ticket
     *
     * 成功返回
     * {"errcode":0, "errmsg":"ok", "ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA", "expires_in":7200}
     * 错误返回
     *
     * @tutorial https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
     * @param _appId
     * @param _secret
     * @returns
     */
    getJSApiTicket(_appId?: string, _secret?: string): Promise<TicketResult>;
    /**
     *
     * 对URL进行权限签名
     * sign a url
     *
     * @param {String} url url for signature
     * @throws {Error}
     * @link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
     */
    jssdkSignature(url: string): Promise<SignatureResult>;
    /**
     *
     * 对URL进行权限签名
     * sign a url
     *
     * @param {String} url
     * @param {String} appId
     * @param {String} secret
     * @throws {Error}
     * @link https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
     */
    jssdkSignature(url: string, appId: string, secret: string): Promise<SignatureResult>;
    /**
     *
     * Check token saved in the cache
     *
     * @param token
     * @returns
     */
    private checkAccessToken;
    /**
     *
     * Check ticket saved in the cache
     *
     * @param ticket
     * @returns
     */
    private checkTicket;
    private chooseAppIdAndSecret;
    /**
     *
     * 通过code换取网页授权access_token
     *
     * 正确返回
     *
     * {
     *
     *   "access_token":"ACCESS_TOKEN",
     *
     *   "expires_in":7200,
     *
     *   "refresh_token":"REFRESH_TOKEN",
     *
     *   "openid":"OPENID",
     *
     *   "scope":"SCOPE"
     *
     * }
     *
     * 错误返回
     *
     * {"errcode":40029,"errmsg":"invalid code"}
     *
     * {"errcode":40013,"errmsg":"iinvalid appid, rid: 61c82e61-2e62fb72-467cb9ec"}
     *
     * @param {String} code
     * @param {String} appId
     * @param {String} secret
     * @returns
     * @tutorial https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/Wechat_webpage_authorization.html#1
     */
    getAccessTokenByCode(code: string, _appId?: string, _secret?: string): Promise<UserAccessTokenResult>;
    /**
     *
     * 公众号向用户发送模板消息
     *
     * @param message
     * @param appId
     * @param secret
     * @returns
     * @tutorial https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html#5
     */
    sendTemplateMessage(message: TemplateMessage, appId?: string, secret?: string): Promise<DefaultRequestResult & {
        msgid: string;
    }>;
    /**
     * 获取用户列表
     * @param nextOpenid
     * @param appId
     * @param secret
     */
    getFollowers(nextOpenid?: string, appId?: string, secret?: string): Promise<DefaultRequestResult & FollowerResult>;
    /**
     * 获取用户基本信息（包括UnionID机制）
     * @param openId
     * @param lang
     */
    getUserInfo(openId: string, lang?: string, appId?: string, secret?: string): Promise<DefaultRequestResult & UserInfoResult>;
    /**
     *
     * 消息加密
     *
     * @param message 明文消息
     * @param timestamp 时间戳
     * @param nonce 随机字符串
     * @returns XML格式字符串 <xml><Encrypt></Encrypt><MsgSignature></MsgSignature><TimeStamp></TimeStamp><Nonce></Nonce></xml>
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
     */
    encryptMessage(message: string, timestamp: string, nonce: string): string;
    /**
     *
     * 消息解密
     *
     * @param signature 签名
     * @param timestamp 时间戳
     * @param nonce 随机字符串
     * @param encryptXml 加密消息XML字符串
     * @returns 消息明文内容
     * @see WeChatService#encryptMessage
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Technical_Plan.html
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Before_Develop/Message_encryption_and_decryption.html
     *
     */
    decryptMessage(signature: string, timestamp: string, nonce: string, encryptXml: string): string;
}
