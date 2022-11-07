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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WeChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const util = __importStar(require("util"));
const miniprogram_service_1 = require("../miniprogram/miniprogram.service");
const cache_1 = require("../utils/cache");
const wepay_service_1 = require("../wepay/wepay.service");
const utils_1 = require("../utils");
let WeChatService = WeChatService_1 = class WeChatService {
    constructor(options) {
        this.options = options;
        this._cacheAdapter = new cache_1.MapCache();
        this.mp = new miniprogram_service_1.MiniProgramService(options);
        this.pay = new wepay_service_1.WePayService();
        if (options && options.cacheAdapter) {
            this.cacheAdapter = options.cacheAdapter;
        }
    }
    set cacheAdapter(adapter) {
        if (adapter) {
            this._cacheAdapter = adapter;
        }
    }
    get cacheAdapter() {
        return this._cacheAdapter;
    }
    /**
     *
     * @deprecated
     * @memberof WeChatService
     */
    get config() {
        return this.options;
    }
    /**
     * @deprecated
     * @memberof WeChatService
     */
    set config(options) {
        this.options = options;
    }
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
    async getAccountAccessToken(_appId, _secret) {
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`;
        const res = await axios_1.default.get(url);
        const ret = res && res.data;
        if (ret.access_token) {
            // eslint-disable-next-line camelcase
            ret.expires_in += (Math.floor(Date.now() / 1000) - 120);
            if (this.cacheAdapter) {
                this.cacheAdapter.set(`${WeChatService_1.KEY_ACCESS_TOKEN}_${appId}`, ret, 7100);
            }
        }
        return ret;
    }
    /**
     * 读取access token的逻辑封装
     *
     * @param _appId
     * @param _secret
     * @returns
     */
    async getToken(_appId, _secret) {
        let accessToken;
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const cache = await this.cacheAdapter.get(`${WeChatService_1.KEY_ACCESS_TOKEN}_${appId}`);
        if (!this.checkAccessToken(cache)) {
            const ret = await this.getAccountAccessToken(appId, secret);
            if (ret && ret.access_token) {
                accessToken = ret.access_token;
            }
        }
        else {
            accessToken = cache.access_token;
        }
        return accessToken;
    }
    /**
     *
     * 读取JS-SDK Ticket逻辑封装
     *
     * @param _appId
     * @param _secret
     * @returns
     */
    async getTicket(_appId, _secret) {
        let ticket = '';
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const cache = await this.cacheAdapter.get(`${WeChatService_1.KEY_TICKET}_${appId}`);
        if (!this.checkTicket(cache)) {
            // expire, request a new ticket
            const ret = await this.getJSApiTicket(appId, secret);
            if (ret && ret.errcode === 0) {
                ticket = ret.ticket;
            }
        }
        else {
            ticket = cache.ticket;
        }
        return ticket;
    }
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
    async getJSApiTicket(_appId, _secret) {
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const accessToken = await this.getToken(appId, secret);
        if (!accessToken) {
            // finally, there was no access token.
            throw new Error(`${WeChatService_1.name}: No access token of official account.`);
        }
        const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
        const ret = await axios_1.default.get(url);
        if (ret.data.errcode === 0) {
            // eslint-disable-next-line camelcase
            ret.data.expires_in += (Math.floor(Date.now() / 1000) - 120);
            if (this.cacheAdapter) {
                this.cacheAdapter.set(`${WeChatService_1.KEY_TICKET}_${appId}`, ret.data, 7100);
            }
        }
        return ret.data;
    }
    async jssdkSignature(url, _appId, _secret) {
        if (!url) {
            throw new Error(`${WeChatService_1.name}: JS-SDK signature must provide url param.`);
        }
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const ticket = await this.getTicket(appId, secret);
        if (!ticket) {
            // finally, there waw no ticket.
            throw new Error(`${WeChatService_1.name}: JS-SDK could NOT get a ticket.`);
        }
        const timestamp = Math.floor(Date.now() / 1000);
        const nonceStr = (0, utils_1.createNonceStr)(16);
        const signStr = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url;
        const signature = (0, crypto_1.createHash)('sha1').update(signStr).digest('hex');
        return {
            appId,
            nonceStr,
            timestamp,
            signature,
        };
    }
    /**
     *
     * Check token saved in the cache
     *
     * @param token
     * @returns
     */
    checkAccessToken(token) {
        return token && token.expires_in > (Date.now() / 1000);
    }
    /**
     *
     * Check ticket saved in the cache
     *
     * @param ticket
     * @returns
     */
    checkTicket(ticket) {
        return ticket && ticket.expires_in > (Date.now() / 1000);
    }
    chooseAppIdAndSecret(appId, secret) {
        let ret;
        if (!appId || !secret) {
            ret = { appId: this.options?.appId, secret: this.options?.secret };
        }
        else {
            ret = { appId, secret };
        }
        if (!ret.appId || !ret.secret) {
            throw new Error(`${WeChatService_1.name}: No appId or secret.`);
        }
        return ret;
    }
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
    async getAccessTokenByCode(code, _appId, _secret) {
        const { appId, secret } = this.chooseAppIdAndSecret(_appId, _secret);
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;
        const ret = await axios_1.default.get(url);
        return ret.data;
    }
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
    async sendTemplateMessage(message, appId, secret) {
        const token = await this.getToken(appId, secret);
        const url = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`;
        const ret = await axios_1.default.post(url, message);
        return ret.data;
    }
    /**
     * 获取用户列表
     * @param nextOpenid
     * @param appId
     * @param secret
     */
    async getFollowers(nextOpenid, appId, secret) {
        const token = await this.getToken(appId, secret);
        let url = util.format(WeChatService_1.getUserUrl, token);
        if (nextOpenid) {
            url += '&next_openid=' + nextOpenid;
        }
        const ret = await axios_1.default.get(url);
        return ret.data;
    }
    /**
     * 获取用户基本信息（包括UnionID机制）
     * @param openId
     * @param lang
     */
    async getUserInfo(openId, lang, appId, secret) {
        const token = await this.getToken(appId, secret);
        let url = util.format(WeChatService_1.getUserInfoUrl, token, openId);
        if (lang) {
            url += '&lang=' + lang;
        }
        const ret = await axios_1.default.get(url);
        return ret.data;
    }
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
    encryptMessage(message, timestamp, nonce) {
        return utils_1.MessageCrypto.encryptMessage(this.config.appId, this.config.token || '', this.config.encodingAESKey || '', message, timestamp, nonce);
    }
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
    decryptMessage(signature, timestamp, nonce, encryptXml) {
        return utils_1.MessageCrypto.decryptMessage(this.config.token || '', this.config.encodingAESKey || '', signature, timestamp, nonce, encryptXml);
    }
};
WeChatService.updateRemarkUrl = 'https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access_token=%s';
WeChatService.getUserUrl = 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=%s';
WeChatService.getUserInfoUrl = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=%s&openid=%s';
WeChatService.batchGetUrl = 'https://api.weixin.qq.com/cgi-bin/user/info/batchget?access_token=%s';
WeChatService.getBlackListUrl = 'https://api.weixin.qq.com/cgi-bin/tags/members/getblacklist?access_token=%s';
WeChatService.batchBlackListUrl = 'https://api.weixin.qq.com/cgi-bin/tags/members/batchblacklist?access_token=%s';
WeChatService.batchUnBlackListUrl = 'https://api.weixin.qq.com/cgi-bin/tags/members/batchunblacklist?access_token=%s';
/**
 * key_access_token
 * @static
 * @memberof WeChatService
 */
WeChatService.KEY_ACCESS_TOKEN = 'key_access_token';
/**
 * key_ticket
 * @static
 * @memberof WeChatService
 */
WeChatService.KEY_TICKET = 'key_ticket';
WeChatService = WeChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], WeChatService);
exports.WeChatService = WeChatService;
