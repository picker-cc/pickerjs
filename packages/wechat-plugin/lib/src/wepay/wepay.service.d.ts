/// <reference types="node" />
import { MiniProgramPaymentParameters, RefundParameters, RefundResult, RequireOnlyOne, Trade, TransactionOrder } from '../types';
import type { Request, Response } from 'express';
export declare class WePayService {
    API_ROOT: string;
    private readonly logger;
    /**
     * 获取平台证书列表
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @param apiKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/wechatpay5_1.shtml
     */
    getPlatformCertificates(mchId: string, serialNo: string, privateKey: Buffer | string, apiKey: string): Promise<{
        sn: string;
        publicKey: string;
    }[]>;
    /**
     * JSAPI下单
     * @param order 下单信息
     * @param serialNo 私钥序列号
     * @param privateKey 私钥
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_1.shtml
     */
    jsapi(order: TransactionOrder, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<{
        prepay_id: string;
    }, any>>;
    h5(): Promise<void>;
    /**
     * 商户订单号查询订单
     * @param id
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     */
    getTransactionById(id: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<Trade, any>>;
    /**
     * 微信支付订单号查询订单
     * @param outTradeNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     */
    getTransactionByOutTradeNo(outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<Trade, any>>;
    /**
     * 关闭订单
     * @param outTradeNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_3.shtml
     */
    close(outTradeNo: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<any, any>>;
    /**
     * 申请退款
     * @param refund
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_9.shtml
     */
    refund(refund: RequireOnlyOne<RefundParameters, 'transaction_id' | 'out_trade_no'>, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<RefundResult, any>>;
    /**
     * 查询单笔退款
     * @param outRefundNo
     * @param mchId
     * @param serialNo
     * @param privateKey
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_10.shtml
     */
    getRefund(outRefundNo: string, mchId: string, serialNo: string, privateKey: Buffer | string): Promise<import("axios").AxiosResponse<RefundResult, any>>;
    private refundedCallback;
    private getTradeBill;
    private getFlowBill;
    /**
     * 支付通知处理程序
     * @param publicKey
     * @param apiKey
     * @param req
     * @param res
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_5.shtml
     */
    paidCallback(publicKey: Buffer | string, apiKey: string, req: Request, res: Response): Promise<Trade>;
    /**
     * 报文解密
     * @param apiKey
     * @param cipher
     * @param associatedData
     * @param nonce
     * @returns
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/wechatpay/wechatpay4_2.shtml
     */
    private decryptCipherText;
    /**
     * 回调或者通知签名验证方法
     * @param publicKey
     * @param timestamp
     * @param nonce
     * @param body
     * @param signature
     * @returns
     */
    private verifySignature;
    /**
     * 构造小程序调起支付参数
     * @param appId String 小程序APPID
     * @param prepayId String JSAPI下单生成的prepay_id
     * @param privateKey String 微信支付私钥
     * @returns MiniProgramPaymentParameters
     * @link https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_5_4.shtml
     */
    buildMiniProgramPayment(appId: string, prepayId: string, privateKey: Buffer | string): MiniProgramPaymentParameters;
    /**
     * 构建请求签名
     * @param mchId
     * @param nonceStr
     * @param timestamp
     * @param serialNo
     * @param signature
     * @returns
     */
    private generateHeader;
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
    private generateSignature;
    /**
     * 读取x509证书序列号
     * @param publicKey
     * @returns
     */
    getCertificateSn(publicKey: Buffer | string): string;
}
