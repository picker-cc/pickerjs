"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
/**
 * 移动用应Service
 */
let MobileService = class MobileService {
    /**
     * 通过 code 获取 access_token
     *
     * @param {string} code
     * @param {string} appId
     * @param {string} secret
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    getAccessToken(code, appId, secret) {
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;
        return axios_1.default.get(url);
    }
    /**
     * 刷新或续期 access_token 使用
     * @param appId
     * @param refreshToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    refreshAccessToken(appId, refreshToken) {
        const url = `https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=${appId}&grant_type=refresh_token&refresh_token=${refreshToken}`;
        return axios_1.default.get(url);
    }
    /**
     * 检验授权凭证（access_token）是否有效
     * @param openId
     * @param accessToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    checkAccessToken(openId, accessToken) {
        const url = `https://api.weixin.qq.com/sns/auth?access_token=${accessToken}&openid=${openId}`;
        return axios_1.default.get(url);
    }
};
MobileService = __decorate([
    (0, common_1.Injectable)()
], MobileService);
exports.MobileService = MobileService;
