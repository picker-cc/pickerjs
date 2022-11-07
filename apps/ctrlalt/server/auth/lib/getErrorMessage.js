"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthTokenErrorMessage = void 0;
function getAuthTokenErrorMessage({ code }) {
    switch (code) {
        case 'FAILURE':
            return '认证令牌赎回失败。';
        case 'TOKEN_EXPIRED':
            return '提供的认证令牌已过期。';
        case 'TOKEN_REDEEMED':
            return '认证令牌是一次性使用的，并且提供的认证令牌已经被赎回。';
    }
}
exports.getAuthTokenErrorMessage = getAuthTokenErrorMessage;
//# sourceMappingURL=getErrorMessage.js.map