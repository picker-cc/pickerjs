import type { Request, Response } from 'express';
import { AuthorizationResult, AuthorizerInfo, AuthorizerListResult, DefaultRequestResult, ParamRegisterWeApp, SubmitAuditItemList } from '../interfaces';
import { ComponentModuleOptions, ICache } from '../types';
export declare class ComponentService {
    private options;
    private readonly logger;
    static KEY_TICKET: string;
    static KEY_TOKEN: string;
    protected _cacheAdapter: ICache;
    set cacheAdapter(adapter: ICache);
    get cacheAdapter(): ICache;
    constructor(options: ComponentModuleOptions);
    /**
     * 对微信第三方平台推送ticket的请求进行处理，
     * 收到请求后，直接返回success，并从请求URL
     * 参数和text body读取ticket加密数据进行解
     * 密，解密后返回ticket并将其保存至cache。
     *
     * @param req
     * @param res
     * @returns
     * @throws
     */
    pushTicket(req: Request, res?: Response): Promise<string>;
    /**
     * TODO:
     * 事件推送URL处理程序
     * @param req
     * @param res
     * @returns
     */
    eventPushHandler(req: Request, res?: Response): Promise<string>;
    /**
     *
     * 启动ticket推送服务
     *
     * @returns
     * @throws
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_verify_ticket_service.html
     */
    startPushTicket(): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    /**
     *
     * 请求获取令牌
     *
     * @returns {component_access_token: '', expires_in: 7200}
     * @throws
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html
     */
    requestComponentToken(): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        component_access_token: string;
        expires_in: number;
    }, any>>;
    /**
     *
     * 获取预授权码
     *
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/pre_auth_code.html
     */
    createPreAuthCode(): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        pre_auth_code: string;
        expires_in: number;
    }, any>>;
    /**
     *
     * 使用授权码获取授权信息
     *
     * 管理员授权确认之后，授权页会自动跳转进入回调 URI，并在 URL 参数中返回授权码和过期时间(redirect_url?auth_code=xxx&expires_in=600)。
     *
     * @param authCode
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorization_info.html
     */
    queryAuth(authCode: string): Promise<import("axios").AxiosResponse<DefaultRequestResult & AuthorizationResult, any>>;
    /**
     * 获取/刷新接口调用令牌
     * @param authorizerAppId
     * @param authorizerRefreshToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html
     */
    requestAuthorizerToken(authorizerAppId: string, authorizerRefreshToken: string): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        authorizer_access_token: string;
        expires_in: number;
        authorizer_refresh_token: string;
    }, any>>;
    /**
     * 获取授权帐号详情
     * @param authorizerAppId
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_get_authorizer_info.html
     */
    requestAuthorizerInfo(authorizerAppId: string): Promise<import("axios").AxiosResponse<DefaultRequestResult & AuthorizerInfo, any>>;
    /**
     *
     * 授权变更通知推送
     *
     * @param req
     * @param res
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorize_event.html
     */
    authChangedPush<T>(req: Request, res: Response): Promise<T>;
    /**
     *
     * 清空api的调用quota
     * errcode = 0, ok, 查询成功
     * errcode = 48006, forbid to clear quota because of reaching the limit, 一个月10次的机会用完了
     * errcode = 400130, invalid appid, appid写错了；或者填入的appid与access_token代表的账号的appid不一致
     * @param authorizerAppId
     * @param authorizerAccessToken
     * @returns DefaultRequestResult
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/clear_quota.html
     */
    clearQuota(authorizerAppId: string, authorizerAccessToken: string): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    /**
     * 查询rid信息
     * @param rid
     * @param authorizerAccessToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/get_rid_info.html
     */
    getRid(rid: string, authorizerAccessToken: string): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    getAuthorizerList(offset?: number, count?: number): Promise<import("axios").AxiosResponse<DefaultRequestResult & AuthorizerListResult, any>>;
    getAccountBasicInfo(authorizerAccessToken: string): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    /**
     * TODO:
     * 设置名称
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/setnickname.html
     */
    setNickname(): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        wording: string;
        audit_id: number;
    }, any>>;
    /**
     * 上传小程序代码并生成体验版
     * @param authorizerAccessToken
     * @param templateId
     * @param extJson
     * @param userVersion
     * @param userDesc
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/commit.html
     */
    codeCommit(authorizerAccessToken: string, templateId: string, extJson: string, userVersion: string, userDesc: string): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    /**
     * 提交审核
     * @param authorizerAccessToken
     * @param itemList
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/submit_audit.html
     */
    codeSubmitAudit(authorizerAccessToken: string, itemList: SubmitAuditItemList): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        auditid: number;
    }, any>>;
    /**
     * 查询指定发布审核单的审核状态
     * @param authorizerAccessToken
     * @param auditId
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/get_auditstatus.html
     */
    codeAuditStatus(authorizerAccessToken: string, auditId: number): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        status: number;
        reason: string;
        screenshot: string;
    }, any>>;
    code2session(authorizerAppId: string, code: string): Promise<import("axios").AxiosResponse<DefaultRequestResult & {
        openid: string;
        session_key: string;
        unionid: string;
    }, any>>;
    /**
     *
     * 快速注册企业小程序
     *
     * @param info
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Register_Mini_Programs/Fast_Registration_Interface_document.html
     */
    fastRegisterWeApp(info: ParamRegisterWeApp): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    /**
     * 查询创建任务状态
     * @param info
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Register_Mini_Programs/Fast_Registration_Interface_document.html#二、查询创建任务状态
     */
    checkFastRegisterWeApp(info: Pick<ParamRegisterWeApp, 'name' | 'legalPersonaWechat' | 'legalPersonaName'>): Promise<import("axios").AxiosResponse<DefaultRequestResult, any>>;
    getTicket(): Promise<string>;
    setTicket(ticket: string): void;
    /**
     *
     * 读取平台access token
     * 缓存有值且未过期时，返回缓存结果
     * 没有缓存时，向微信服务器发起请求，
     * 请求结果正常时，保存token到缓存，
     * 并且返回，其他情况抛出异常。
     *
     * @returns
     * @throws
     */
    getComponentAccessToken(): Promise<{
        componentAccessToken: string;
        expiresAt: number;
    }>;
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
