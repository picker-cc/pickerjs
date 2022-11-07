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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WePayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WePayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
const node_forge_1 = __importDefault(require("node-forge"));
const raw_body_1 = __importDefault(require("raw-body"));
const utils_1 = require("../utils");
let WePayService = WePayService_1 = class WePayService {
    constructor() {
        this.API_ROOT = 'https://api.mch.weixin.qq.com';
        this.logger = new common_1.Logger(WePayService_1.name);
    }
    /**
     * 获取平台证书列表
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @param apiKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
     */
    async getPlatformCertificates(mchId, serialNo, privateKey, apiKey) {
        const certs = [];
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = '/v3/certificates';
        const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
        url = 'https://api.mch.weixin.qq.com' + url;
        const ret = await axios_1.default.get(url, { headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature) });
        // console.log('ret.data.data =', ret.data.data);
        if (ret && ret.status === 200 && ret.data) {
            const certificates = ret.data.data;
            for (const cert of certificates) {
                const publicKey = this.decryptCipherText(apiKey, cert.encrypt_certificate.ciphertext, cert.encrypt_certificate.associated_data, cert.encrypt_certificate.nonce);
                const sn = this.getCertificateSn(publicKey);
                certs.push({ sn, publicKey });
            }
        }
        return certs;
    }
    /**
     * JSAPI下单
     * @param order 下单信息
     * @param serialNo 私钥序列号
     * @param privateKey 私钥
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml
     */
    async jsapi(order, serialNo, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = '/v3/pay/transactions/jsapi';
        const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, order);
        url = 'https://api.mch.weixin.qq.com' + url;
        return axios_1.default.post(url, order, {
            headers: this.generateHeader(order.mchid, nonceStr, timestamp, serialNo, signature),
        });
    }
    async h5() {
        // H5下单
        // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_3_1.shtml
        // https://api.mch.weixin.qq.com/v3/pay/transactions/h5
    }
    /**
     * 商户订单号查询订单
     * @param id
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     */
    async getTransactionById(id, mchId, serialNo, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = `/v3/pay/transactions/id/${id}?mchid=${mchId}`;
        const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
        url = 'https://api.mch.weixin.qq.com' + url;
        return axios_1.default.get(url, {
            headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
        });
    }
    /**
     * 微信支付订单号查询订单
     * @param outTradeNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     */
    async getTransactionByOutTradeNo(outTradeNo, mchId, serialNo, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${mchId}`;
        const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
        url = 'https://api.mch.weixin.qq.com' + url;
        return axios_1.default.get(url, {
            headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
        });
    }
    /**
     * 关闭订单
     * @param outTradeNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_3.shtml
     */
    async close(outTradeNo, mchId, serialNo, privateKey) {
        const data = { mchid: mchId };
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`;
        const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, data);
        url = 'https://api.mch.weixin.qq.com' + url;
        return axios_1.default.post(url, data, {
            headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
        });
    }
    /**
     * 申请退款
     * @param refund
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_9.shtml
     */
    async refund(refund, mchId, serialNo, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = '/v3/refund/domestic/refunds';
        const signature = this.generateSignature('POST', url, timestamp, nonceStr, privateKey, refund);
        url = 'https://api.mch.weixin.qq.com' + url;
        return axios_1.default.post(url, refund, {
            headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
        });
    }
    /**
     * 查询单笔退款
     * @param outRefundNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_10.shtml
     */
    async getRefund(outRefundNo, mchId, serialNo, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        let url = `/v3/refund/domestic/refunds/${outRefundNo}`;
        const signature = this.generateSignature('GET', url, timestamp, nonceStr, privateKey);
        url = this.API_ROOT + url;
        return axios_1.default.get(url, {
            headers: this.generateHeader(mchId, nonceStr, timestamp, serialNo, signature),
        });
    }
    async refundedCallback() {
        // 退款结果通知
        // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_11.shtml
        //
    }
    async getTradeBill() {
        // 申请交易账单
        // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_6.shtml
        // https://api.mch.weixin.qq.com/v3/bill/tradebill
        // get
    }
    async getFlowBill() {
        // 申请资金账单
        // https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_7.shtml
        // https://api.mch.weixin.qq.com/v3/bill/fundflowbill
        // get
    }
    /**
     * 支付通知处理程序
     * @param publicKey
     * @param apiKey
     * @param req
     * @param res
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_5.shtml
     */
    async paidCallback(publicKey, apiKey, req, res) {
        const signature = req.headers['Wechatpay-Signature'];
        const platformSerial = req.headers['Wechatpay-Serial'];
        const timestamp = req.headers['Wechatpay-Timestamp'];
        const nonce = req.headers['Wechatpay-Nonce'];
        let rawBody;
        try {
            rawBody = await (0, raw_body_1.default)(req);
        }
        catch (error) {
            const message = error.message;
            this.logger.debug(message);
            if (message === 'stream is not readable') {
                rawBody = req.body;
            }
        }
        this.logger.debug(`Wechatpay-Signature = ${signature}`);
        this.logger.debug(`Wechatpay-Serial = ${platformSerial}`);
        this.logger.debug(`Wechatpay-Timestamp = ${timestamp}`);
        this.logger.debug(`Wechatpay-Nonce = ${nonce}`);
        this.logger.debug(`Body = ${typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)}`);
        let verified = false;
        const responseData = { code: 'FAIL', message: '' };
        let result = {};
        const serial = this.getCertificateSn(publicKey);
        if (serial === platformSerial) {
            verified = this.verifySignature(publicKey, timestamp, nonce, rawBody, signature);
            if (verified) {
                const resource = JSON.parse(rawBody.toString());
                result = this.decryptCipherText(apiKey, resource.ciphertext, resource.associated_data, resource.nonce);
            }
            else {
                responseData.message = 'VERIFY SIGNATURE FAIL';
            }
        }
        else {
            responseData.message = 'SERIAL INCORRECT';
        }
        if (verified && res && typeof res.send === 'function') {
            res.status(200).send();
        }
        else {
            res.status(401).json(responseData);
        }
        return result;
    }
    /**
     * 报文解密
     * @param apiKey
     * @param cipher
     * @param associatedData
     * @param nonce
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
     */
    decryptCipherText(apiKey, cipher, associatedData, nonce) {
        // algorithm: AEAD_AES_256_GCM
        const buff = Buffer.from(cipher, 'base64');
        const authTag = buff.slice(buff.length - 16);
        const data = buff.slice(0, buff.length - 16);
        const decipher = crypto.createDecipheriv('aes-256-gcm', apiKey, nonce);
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from(associatedData));
        const decoded = decipher.update(data, undefined, 'utf8');
        decipher.final();
        try {
            return JSON.parse(decoded);
        }
        catch (e) {
            return decoded;
        }
    }
    /**
     * 回调或者通知签名验证方法
     * @param publicKey
     * @param timestamp
     * @param nonce
     * @param body
     * @param signature
     * @returns
     */
    verifySignature(publicKey, timestamp, nonce, body, signature) {
        const message = `${timestamp}\n${nonce}\n${typeof body === 'string' ? body : JSON.stringify(body)}\n`;
        const verify = crypto.createVerify('RSA-SHA256').update(Buffer.from(message));
        return verify.verify(publicKey, signature, 'base64');
    }
    /**
     * 构造小程序调起支付参数
     * @param appId String 小程序APPID
     * @param prepayId String JSAPI下单生成的prepay_id
     * @param privateKey String 微信支付私钥
     * @returns MiniProgramPaymentParameters
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_4.shtml
     */
    buildMiniProgramPayment(appId, prepayId, privateKey) {
        const nonceStr = (0, utils_1.createNonceStr)();
        const timestamp = Math.floor(Date.now() / 1000);
        const message = `${appId}\n${timestamp}\n${nonceStr}\nprepay_id=${prepayId}\n`;
        const paySign = crypto.createSign('sha256WithRSAEncryption').update(message).sign(privateKey, 'base64');
        return {
            timeStamp: timestamp.toString(),
            nonceStr,
            package: `prepay_id=${prepayId}`,
            signType: 'RSA',
            paySign,
        };
    }
    /**
     * 构建请求签名
     * @param mchId
     * @param nonceStr
     * @param timestamp
     * @param serialNo
     * @param signature
     * @returns
     */
    generateHeader(mchId, nonceStr, timestamp, serialNo, signature) {
        return {
            'Authorization': `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`,
        };
    }
    /**
     * 生成请求签名串
     * @param method
     * @param url
     * @param timestamp
     * @param nonceStr
     * @param privateKey
     * @param body
     * @returns
     */
    generateSignature(method, url, timestamp, nonceStr, privateKey, body) {
        let message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n\n`;
        if (method === 'POST') {
            if (!body) {
                body = {};
            }
            message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${typeof body === 'string' ? body : JSON.stringify(body)}\n`;
        }
        return crypto.createSign('sha256WithRSAEncryption').update(message).sign(privateKey, 'base64');
    }
    /**
     * 读取x509证书序列号
     * @param publicKey
     * @returns
     */
    getCertificateSn(publicKey) {
        return node_forge_1.default.pki.certificateFromPem(publicKey.toString()).serialNumber.toUpperCase();
    }
};
WePayService = WePayService_1 = __decorate([
    (0, common_1.Injectable)()
], WePayService);
exports.WePayService = WePayService;
