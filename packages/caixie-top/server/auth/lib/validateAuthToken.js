"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuthToken = void 0;
const validateSecret_1 = require("./validateSecret");
function sanitiseValidForMinsConfig(input) {
    const parsed = Number.parseFloat(input);
    return parsed ? Math.max(1 / 6, Math.min(parsed, 60 * 24)) : 10;
}
async function validateAuthToken(listKey, tokenType, identityField, identity, tokenValidMins, token, dbItemAPI) {
    const result = await (0, validateSecret_1.validateSecret)(identityField, identity, `${tokenType}Token`, token, dbItemAPI);
    if (!result.success) {
        return { success: false, code: 'FAILURE' };
    }
    const { item } = result;
    const fieldKeys = { issuedAt: `${tokenType}IssuedAt`, redeemedAt: `${tokenType}RedeemedAt` };
    if (item[fieldKeys.redeemedAt]) {
        return { success: false, code: 'TOKEN_REDEEMED' };
    }
    if (!item[fieldKeys.issuedAt] || typeof item[fieldKeys.issuedAt].getTime !== 'function') {
        throw new Error(`Error redeeming authToken: field ${listKey}.${fieldKeys.issuedAt} isn't a valid Date object.`);
    }
    const elapsedMins = (Date.now() - item[fieldKeys.issuedAt].getTime()) / (1000 * 60);
    const validForMins = sanitiseValidForMinsConfig(tokenValidMins);
    if (elapsedMins > validForMins) {
        return { success: false, code: 'TOKEN_EXPIRED' };
    }
    return { success: true, item };
}
exports.validateAuthToken = validateAuthToken;
//# sourceMappingURL=validateAuthToken.js.map