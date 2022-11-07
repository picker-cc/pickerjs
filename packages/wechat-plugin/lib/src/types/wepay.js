"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundChannel = exports.FundsAccount = exports.RefundStatus = exports.TradeType = exports.TradeStatus = void 0;
/**
 * 交易状态
 */
var TradeStatus;
(function (TradeStatus) {
    /**
     * 支付成功
     */
    TradeStatus["SUCCESS"] = "SUCCESS";
    /**
     * 转入退款
     */
    TradeStatus["REFUND"] = "REFUND";
    /**
     * 未支付
     */
    TradeStatus["NOTPAY"] = "NOTPAY";
    /**
     * 已关闭
     */
    TradeStatus["CLOSED"] = "CLOSED";
    /**
     * 已撤销（仅付款码支付会返回）
     */
    TradeStatus["REVOKED"] = "REVOKED";
    /**
     * 用户支付中（仅付款码支付会返回）
     */
    TradeStatus["USERPAYIN"] = "USERPAYIN";
    /**
     * 支付失败（仅付款码支付会返回）
     */
    TradeStatus["PAYERROR"] = "PAYERROR";
})(TradeStatus = exports.TradeStatus || (exports.TradeStatus = {}));
/**
 * 交易类型
 */
var TradeType;
(function (TradeType) {
    /**
     * 公从号支付
     */
    TradeType["JSAPI"] = "JSAPI";
    /**
     * 扫码支付
     */
    TradeType["NATIVE"] = "NATIVE";
    /**
     * APP支付
     */
    TradeType["APP"] = "APP";
    /**
     * 付款码支付
     */
    TradeType["MICROPAY"] = "MICROPAY";
    /**
     * H5支付
     */
    TradeType["MWEB"] = "MWEB";
    /**
     * 刷脸支付
     */
    TradeType["FACEPAY"] = "FACEPAY";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
/**
 * 退款状态
 */
var RefundStatus;
(function (RefundStatus) {
    /**
     * 退款成功
     */
    RefundStatus["SUCCESS"] = "SUCCESS";
    /**
     * 退款关闭
     */
    RefundStatus["CLOSED"] = "CLOSED";
    /**
     * 退款处理中
     */
    RefundStatus["PROCESSING"] = "PROCESSING";
    /**
     * 退款异常
     */
    RefundStatus["ABNORMAL"] = "ABNORMAL";
})(RefundStatus = exports.RefundStatus || (exports.RefundStatus = {}));
/**
 * 资金账户
 */
var FundsAccount;
(function (FundsAccount) {
    /**
     * 未结算资金
     */
    FundsAccount["UNSETTLED"] = "UNSETTLED";
    /**
     * 可用余额
     */
    FundsAccount["AVAILABLE"] = "AVAILABLE";
    /**
     * 不可用余额
     */
    FundsAccount["UNAVAILABLE"] = "UNAVAILABLE";
    /**
     * 运营户
     */
    FundsAccount["OPERATION"] = "OPERATION";
    /**
     * 基本账户（含可用余额和不可用余额）
     */
    FundsAccount["BASIC"] = "BASIC";
})(FundsAccount = exports.FundsAccount || (exports.FundsAccount = {}));
/**
 * 退款渠道
 */
var RefundChannel;
(function (RefundChannel) {
    /**
     * 原路退款
     */
    RefundChannel["ORIGINAL"] = "ORIGINAL";
    /**
     * 退回到余额
     */
    RefundChannel["BALANCE"] = "BALANCE";
    /**
     * 原账户异常退到其他余额账户
     */
    RefundChannel["OTHER_BALANCE"] = "OTHER_BALANCE";
    /**
     * 原银行卡异常退到其他银行卡
     */
    RefundChannel["OTHER_BANKCARD"] = "OTHER_BANKCARD";
})(RefundChannel = exports.RefundChannel || (exports.RefundChannel = {}));
