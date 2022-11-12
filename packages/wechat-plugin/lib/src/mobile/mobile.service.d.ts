import { DefaultRequestResult } from '../interfaces';
import { MobileAppAccessTokenResult } from './mobile.types';
/**
 * 移动用应Service
 */
export declare class MobileService {
    /**
     * 通过 code 获取 access_token
     *
     * @param {string} code
     * @param {string} appId
     * @param {string} secret
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    getAccessToken(code: string, appId: string, secret: string): Promise<import("axios").AxiosResponse<MobileAppAccessTokenResult, any>>;
    /**
     * 刷新或续期 access_token 使用
     * @param appId
     * @param refreshToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    refreshAccessToken(appId: string, refreshToken: string): Promise<import("axios").AxiosResponse<MobileAppAccessTokenResult, any>>;
    /**
     * 检验授权凭证（access_token）是否有效
     * @param openId
     * @param accessToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Mobile_App/WeChat_Login/Authorized_API_call_UnionID.html
     */
    checkAccessToken(openId: string, accessToken: string): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
}
