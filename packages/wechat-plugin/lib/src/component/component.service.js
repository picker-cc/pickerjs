"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ComponentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fast_xml_parser_1 = require("fast-xml-parser");
const raw_body_1 = __importDefault(require("raw-body"));
const utils_1 = require("../utils");
let ComponentService = ComponentService_1 = class ComponentService {
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(ComponentService_1.name);
        this._cacheAdapter = new utils_1.MapCache();
        if (options && options.cacheAdapter) {
            this.cacheAdapter = options.cacheAdapter;
        }
    }
    set cacheAdapter(adapter) {
        if (adapter) {
            // eslint-disable-next-line no-underscore-dangle
            this._cacheAdapter = adapter;
        }
    }
    get cacheAdapter() {
        // eslint-disable-next-line no-underscore-dangle
        return this._cacheAdapter;
    }
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
    async pushTicket(req, res) {
        const timestamp = req.query && req.query.timestamp;
        const nonce = req.query && req.query.nonce;
        const signature = req.query && req.query.msg_signature;
        const rawBody = await (0, raw_body_1.default)(req);
        let ticket = '';
        if (timestamp && nonce && signature && rawBody) {
            const decrypt = this.decryptMessage(signature, timestamp, nonce, rawBody.toString());
            const parser = new fast_xml_parser_1.XMLParser();
            const xml = parser.parse(decrypt).xml;
            const componentVerifyTicket = xml.ComponentVerifyTicket;
            this.setTicket(componentVerifyTicket);
            ticket = componentVerifyTicket;
        }
        if (res && typeof res.send === 'function') {
            res.send('success');
        }
        return ticket;
    }
    /**
     * TODO:
     * 事件推送URL处理程序
     * @param req
     * @param res
     * @returns
     */
    async eventPushHandler(req, res) {
        const timestamp = req.query && req.query.timestamp;
        const nonce = req.query && req.query.nonce;
        const signature = req.query && req.query.msg_signature;
        const rawBody = await (0, raw_body_1.default)(req);
        if (timestamp && nonce && signature && rawBody) {
            const decrypt = this.decryptMessage(signature, timestamp, nonce, rawBody.toString());
            const parser = new fast_xml_parser_1.XMLParser();
            const xml = parser.parse(decrypt).xml;
            const infoType = xml.InfoType;
            this.logger.debug(`eventPushHandler infoType = ${infoType}`);
        }
        if (res && typeof res.send === 'function') {
            res.send('success');
        }
        return '';
    }
    /**
     *
     * 启动ticket推送服务
     *
     * @returns
     * @throws
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_verify_ticket_service.html
     */
    async startPushTicket() {
        const url = 'https://api.weixin.qq.com/cgi-bin/component/api_start_push_ticket';
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            component_secret: this.options.componentSecret
        });
    }
    /**
     *
     * 请求获取令牌
     *
     * @returns {component_access_token: '', expires_in: 7200}
     * @throws
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/component_access_token.html
     */
    async requestComponentToken() {
        const ticket = await this.getTicket();
        const url = 'https://api.weixin.qq.com/cgi-bin/component/api_component_token';
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            component_appsecret: this.options.componentSecret,
            // eslint-disable-next-line camelcase
            component_verify_ticket: ticket
        });
    }
    /**
     *
     * 获取预授权码
     *
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/pre_auth_code.html
     */
    async createPreAuthCode() {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId
        });
    }
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
    async queryAuth(authCode) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            authorization_code: authCode
        });
    }
    /**
     * 获取/刷新接口调用令牌
     * @param authorizerAppId
     * @param authorizerRefreshToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_authorizer_token.html
     */
    async requestAuthorizerToken(authorizerAppId, authorizerRefreshToken) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            authorizer_appid: authorizerAppId,
            // eslint-disable-next-line camelcase
            authorizer_refresh_token: authorizerRefreshToken
        });
    }
    /**
     * 获取授权帐号详情
     * @param authorizerAppId
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/api_get_authorizer_info.html
     */
    async requestAuthorizerInfo(authorizerAppId) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/api_get_authorizer_info?component_access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            authorizer_appid: authorizerAppId
        });
    }
    /**
     *
     * 授权变更通知推送
     *
     * @param req
     * @param res
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/ThirdParty/token/authorize_event.html
     */
    async authChangedPush(req, res) {
        const timestamp = req.query && req.query.timestamp;
        const nonce = req.query && req.query.nonce;
        const signature = req.query && req.query.msg_signature;
        const rawBody = await (0, raw_body_1.default)(req);
        let xml;
        if (timestamp && nonce && signature && rawBody) {
            try {
                const decrypt = this.decryptMessage(signature, timestamp, nonce, rawBody.toString());
                const parser = new fast_xml_parser_1.XMLParser();
                xml = parser.parse(decrypt).xml;
            }
            catch (error) {
                this.logger.error(error.message);
            }
        }
        res.send('success');
        return xml;
    }
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
    async clearQuota(authorizerAppId, authorizerAccessToken) {
        const url = `https://api.weixin.qq.com/cgi-bin/clear_quota?access_token=${authorizerAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            appid: authorizerAppId
        });
    }
    /**
     * 查询rid信息
     * @param rid
     * @param authorizerAccessToken
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/openApi/get_rid_info.html
     */
    async getRid(rid, authorizerAccessToken) {
        const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${authorizerAccessToken}`;
        return axios_1.default.post(url, {
            rid
        });
    }
    // ========== 授权方账号管理 ==========
    async getAuthorizerList(offset = 0, count = 100) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/openapi/rid/get?access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            component_appid: this.options.componentAppId,
            offset,
            count
        });
    }
    // ========== 授权方账号管理 ==========
    // ========== 小程序基础信息设置 ==========
    async getAccountBasicInfo(authorizerAccessToken) {
        const url = `https://api.weixin.qq.com/cgi-bin/account/getaccountbasicinfo?access_token=${authorizerAccessToken}`;
        return axios_1.default.get(url);
    }
    /**
     * TODO:
     * 设置名称
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Mini_Program_Basic_Info/setnickname.html
     */
    async setNickname() {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/wxa/setnickname?access_token=${token.componentAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            nick_name: this.options.componentAppId,
            // eslint-disable-next-line camelcase
            id_card: '',
            license: '',
            // eslint-disable-next-line camelcase
            naming_other_stuff_1: ''
        });
    }
    // ========== 小程序基础信息设置 ==========
    // ========== 小程序代码管理 ==========
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
    // eslint-disable-next-line max-params
    async codeCommit(authorizerAccessToken, templateId, extJson, userVersion, userDesc) {
        const url = `https://api.weixin.qq.com/wxa/commit?access_token=${authorizerAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            template_id: templateId,
            // eslint-disable-next-line camelcase
            ext_json: extJson,
            // eslint-disable-next-line camelcase
            user_version: userVersion,
            // eslint-disable-next-line camelcase
            user_desc: userDesc
        });
    }
    /**
     * 提交审核
     * @param authorizerAccessToken
     * @param itemList
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/submit_audit.html
     */
    async codeSubmitAudit(authorizerAccessToken, itemList) {
        const url = `https://api.weixin.qq.com/wxa/submit_audit?access_token=${authorizerAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            item_list: itemList
        });
    }
    /**
     * 查询指定发布审核单的审核状态
     * @param authorizerAccessToken
     * @param auditId
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/code/get_auditstatus.html
     */
    async codeAuditStatus(authorizerAccessToken, auditId) {
        const url = `https://api.weixin.qq.com/wxa/get_auditstatus?access_token=${authorizerAccessToken}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            auditid: auditId
        });
    }
    // ========== 小程序代码管理 ==========
    // ========== 其他小程序业务代码 ==========
    async code2session(authorizerAppId, code) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/sns/component/jscode2session?appid=${authorizerAppId}&js_code=${code}&grant_type=authorization_code&component_appid=${this.options.componentAppId}&component_access_token=${token}`;
        return axios_1.default.get(url);
    }
    // ========== 其他小程序业务代码 ==========
    // ========== 代商家注册小程序 ==========
    /**
     *
     * 快速注册企业小程序
     *
     * @param info
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Register_Mini_Programs/Fast_Registration_Interface_document.html
     */
    async fastRegisterWeApp(info) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/fastregisterweapp?action=create&component_access_token=${token}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            name: info.name,
            code: info.code,
            // eslint-disable-next-line camelcase
            code_type: info.codeType || 1,
            // eslint-disable-next-line camelcase
            legal_persona_wechat: info.legalPersonaWechat,
            // eslint-disable-next-line camelcase
            legal_persona_name: info.legalPersonaName,
            // eslint-disable-next-line camelcase
            component_phone: info.componentPhone
        });
    }
    /**
     * 查询创建任务状态
     * @param info
     * @returns
     * @link https://developers.weixin.qq.com/doc/oplatform/Third-party_Platforms/2.0/api/Register_Mini_Programs/Fast_Registration_Interface_document.html#二、查询创建任务状态
     */
    async checkFastRegisterWeApp(info) {
        const token = await this.getComponentAccessToken();
        const url = `https://api.weixin.qq.com/cgi-bin/component/fastregisterweapp?action=search&component_access_token=${token}`;
        return axios_1.default.post(url, {
            // eslint-disable-next-line camelcase
            name: info.name,
            // eslint-disable-next-line camelcase
            legal_persona_wechat: info.legalPersonaWechat,
            // eslint-disable-next-line camelcase
            legal_persona_name: info.legalPersonaName
        });
    }
    // ========== 代商家注册小程序 ==========
    getTicket() {
        return this.cacheAdapter.get(ComponentService_1.KEY_TICKET);
    }
    setTicket(ticket) {
        this.cacheAdapter.set(ComponentService_1.KEY_TICKET, ticket);
    }
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
    async getComponentAccessToken() {
        const token = await this.cacheAdapter.get(ComponentService_1.KEY_TOKEN);
        if (token && token.expiresAt >= Date.now()) {
            return token;
        }
        const ret = await this.requestComponentToken();
        if (ret && ret.data) {
            if (ret.data.component_access_token) {
                const newToken = {
                    componentAccessToken: ret.data.component_access_token,
                    expiresAt: Date.now() + (ret.data.expires_in - 100) * 1000
                };
                this.cacheAdapter.set(ComponentService_1.KEY_TOKEN, newToken, ret.data.expires_in - 100);
                return newToken;
            }
            throw new Error(`${ret.data.errcode},${ret.data.errmsg}`);
        }
        else {
            throw new Error('http no response data');
        }
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
        return utils_1.MessageCrypto.encryptMessage(this.options.componentAppId, this.options.componentToken || '', this.options.componentEncodingAESKey || '', message, timestamp, nonce);
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
    // eslint-disable-next-line max-params
    decryptMessage(signature, timestamp, nonce, encryptXml) {
        return utils_1.MessageCrypto.decryptMessage(this.options.componentToken || '', this.options.componentEncodingAESKey || '', signature, timestamp, nonce, encryptXml);
    }
};
ComponentService.KEY_TICKET = 'key_component_ticket';
ComponentService.KEY_TOKEN = 'key_component_access_token';
ComponentService = ComponentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ComponentService);
exports.ComponentService = ComponentService;
