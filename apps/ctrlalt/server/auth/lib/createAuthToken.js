"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthToken = void 0;
const crypto_1 = require("crypto");
function generateToken(length) {
    return (0, crypto_1.randomBytes)(length)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, length);
}
async function createAuthToken(identityField, identity, dbItemAPI) {
    const item = await dbItemAPI.findOne({ where: { [identityField]: identity } });
    if (item) {
        return { success: true, itemId: item.id, token: generateToken(20) };
    }
    else {
        return { success: false };
    }
}
exports.createAuthToken = createAuthToken;
//# sourceMappingURL=createAuthToken.js.map