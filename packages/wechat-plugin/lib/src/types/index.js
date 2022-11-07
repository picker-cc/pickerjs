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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatActionType = void 0;
__exportStar(require("./utils"), exports);
__exportStar(require("./wepay"), exports);
var WechatActionType;
(function (WechatActionType) {
    // GET_TOKEN = "GET_TOKEN",
    // DISTRIBUTED_ORDER_PROMOTION = 'DISTRIBUTED_ORDER_PROMOTION',
    // OTHER = 'OTHER',
    // PROMOTION = 'PROMOTION'
    WechatActionType["SEND_TEMPLATE_MESSAGE"] = "SEND_TEMPLATE_MESSAGE";
    WechatActionType["GET_FOLLOWERS"] = "GET_FOLLOWERS";
    WechatActionType["GET_USER_INFO"] = "GET_USER_INFO";
})(WechatActionType = exports.WechatActionType || (exports.WechatActionType = {}));
