"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSecret = void 0;
async function validateSecret(identityField, identity, secretField, secret, dbItemAPI) {
    const item = await dbItemAPI.findOne({ where: { [identityField]: identity } });
    if (!item || !item[secretField]) {
        return { success: false };
    }
    else {
        return { success: false };
    }
}
exports.validateSecret = validateSecret;
//# sourceMappingURL=validateSecret.js.map