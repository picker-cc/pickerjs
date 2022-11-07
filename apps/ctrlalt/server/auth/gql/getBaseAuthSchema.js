"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseAuthSchema = void 0;
const core_1 = require("@pickerjs/core");
const ali_sms_plugin_1 = require("@pickerjs/ali-sms-plugin");
const generate_public_id_1 = require("@pickerjs/common/lib/generate-public-id");
function getBaseAuthSchema({ listKey, identityField, secretField, gqlNames, base, }) {
    const ItemAuthenticationWithPasswordSuccess = core_1.graphql.object()({
        name: gqlNames.ItemAuthenticationWithVerifyCodeSuccess,
        fields: {
            sessionToken: core_1.graphql.field({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
            item: core_1.graphql.field({ type: core_1.graphql.nonNull(base.object(listKey)) }),
        },
    });
    const ItemAuthenticationWithPasswordFailure = core_1.graphql.object()({
        name: gqlNames.ItemAuthenticationWithVerifyCodeFailure,
        fields: {
            message: core_1.graphql.field({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
        },
    });
    const AuthenticationResult = core_1.graphql.union({
        name: gqlNames.ItemAuthenticationWithVerifyCodeResult,
        types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
        resolveType(val) {
            if ('sessionToken' in val) {
                return gqlNames.ItemAuthenticationWithVerifyCodeSuccess;
            }
            return gqlNames.ItemAuthenticationWithVerifyCodeFailure;
        },
    });
    const ItemSendVerifyCodeSuccess = core_1.graphql.object()({
        name: gqlNames.ItemSendVerifyCodeSuccess,
        fields: {
            message: core_1.graphql.field({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
        },
    });
    const ItemSendVerifyCodeFailure = core_1.graphql.object()({
        name: gqlNames.ItemSendVerifyCodeFailure,
        fields: {
            message: core_1.graphql.field({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
        },
    });
    const SendVerifyCodeResult = core_1.graphql.union({
        name: gqlNames.ItemSendVerifyCodeResult,
        types: [ItemSendVerifyCodeSuccess, ItemSendVerifyCodeFailure],
        resolveType(val) {
            if ('code' in val) {
                return gqlNames.ItemSendVerifyCodeFailure;
            }
            return gqlNames.ItemSendVerifyCodeSuccess;
        },
    });
    const extension = {
        query: {
            authenticatedItem: core_1.graphql.field({
                type: core_1.graphql.union({
                    name: 'AuthenticatedItem',
                    types: [base.object(listKey)],
                    resolveType: (root, context) => context.session?.listKey,
                }),
                resolve(root, args, { session, db }) {
                    if (typeof session?.itemId === 'string' && typeof session.listKey === 'string') {
                        return db[session.listKey].findOne({ where: { id: session.itemId } });
                    }
                    return null;
                },
            }),
        },
        mutation: {
            [gqlNames.sendItemVerifyCode]: core_1.graphql.field({
                type: SendVerifyCodeResult,
                args: {
                    [identityField]: core_1.graphql.arg({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
                },
                async resolve(root, { [identityField]: identity }, context) {
                    const item = await context.query.User.findOne({
                        where: { [identityField]: identity },
                        query: `
                            id
                            verifyCodeCreatedAt
                            verifyCode
                            identifier
                        `
                    });
                    const verifyCode = (0, generate_public_id_1.generateCode)(6);
                    const dbItemAPI = context.sudo().db[listKey];
                    if (!item || !item['verifyCode']) {
                        const user = await dbItemAPI.createOne({
                            data: {
                                identifier: identity,
                                password: identity,
                                verifyCode,
                                verifyCodeCreatedAt: new Date()
                            }
                        });
                        return { code: 'SUCCESS', message: '验证码已发送' };
                    }
                    else {
                        console.log('检查验证码时效');
                        console.log(item);
                        const now = Date.now();
                        if (now < (new Date(item['verifyCodeCreatedAt']).getTime() + 1 * 60 * 1000)) {
                            return { code: 'FAILURE', message: '验证码已发送，请稍后重试' };
                        }
                        else {
                            console.log('已过时效可以发短信了。。。。');
                            await dbItemAPI.updateOne({
                                where: { id: item.id },
                                data: {
                                    verifyCode,
                                    verifyCodeCreatedAt: new Date()
                                }
                            });
                            context.eventBus.publish(new ali_sms_plugin_1.SmsEvent('verification', identity, verifyCode));
                        }
                    }
                    return { code: 'FAILURE', message: '验证码已发送，请稍后重试' };
                }
            }),
            [gqlNames.authenticateItemWithVerifyCode]: core_1.graphql.field({
                type: AuthenticationResult,
                args: {
                    [identityField]: core_1.graphql.arg({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
                    [secretField]: core_1.graphql.arg({ type: core_1.graphql.nonNull(core_1.graphql.String) }),
                },
                async resolve(root, { [identityField]: identity, [secretField]: secret }, context) {
                    if (!context.startSession) {
                        throw new Error('上下文上没有可用的会话实现');
                    }
                    const item = await context.query[listKey].findOne({
                        where: { [identityField]: identity },
                        query: `
                            id
                            verifyCodeCreatedAt
                            verifyCode
                            identifier
                        `
                    });
                    if (!item) { }
                    const dbItemAPI = context.sudo().db[listKey];
                    const now = Date.now();
                    if (now < (new Date(item['verifyCodeCreatedAt']).getTime() + 10 * 60 * 1000)) {
                        await dbItemAPI.updateOne({
                            where: { id: item.id },
                            data: {
                                verifyCode: '',
                                verifyCodeCreatedAt: new Date()
                            }
                        });
                        return { code: 'FAILURE', message: '验证码已失效，请重新发送验证码' };
                    }
                    else {
                        const result = {
                            success: false,
                            item
                        };
                        if (secret === item[secretField]) {
                            const sessionToken = await context.startSession({
                                listKey,
                                itemId: result.item.id.toString(),
                            });
                            return { sessionToken, item: result.item };
                        }
                        else {
                            return { code: 'FAILURE', message: '验证失败' };
                        }
                    }
                },
            }),
        },
    };
    return { extension, ItemAuthenticationWithPasswordSuccess };
}
exports.getBaseAuthSchema = getBaseAuthSchema;
//# sourceMappingURL=getBaseAuthSchema.js.map
