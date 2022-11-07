import {AuthGqlNames} from '../types';

import {graphql, BaseItem, PickerContext, PickerDbAPI} from "@picker-cc/core";
import {SmsEvent} from "@picker-cc/ali-sms-plugin";
import {generateCode} from "@picker-cc/common/lib/generate-public-id";

export function getBaseAuthSchema<I extends string, S extends string>({
                                                                          listKey,
                                                                          identityField,
                                                                          secretField,
                                                                          gqlNames,
                                                                          base,
                                                                      }: {
    listKey: string;
    identityField: I;
    secretField: S;
    gqlNames: AuthGqlNames;
    base: graphql.BaseSchemaMeta;
}): any {
    const ItemAuthenticationWithPasswordSuccess = graphql.object<{
        sessionToken: string;
        item: BaseItem;
    }>()({
        name: gqlNames.ItemAuthenticationWithVerifyCodeSuccess,
        fields: {
            sessionToken: graphql.field({type: graphql.nonNull(graphql.String)}),
            item: graphql.field({type: graphql.nonNull(base.object(listKey))}),
        },
    });
    const ItemAuthenticationWithPasswordFailure = graphql.object<{ message: string }>()({
        name: gqlNames.ItemAuthenticationWithVerifyCodeFailure,
        fields: {
            message: graphql.field({type: graphql.nonNull(graphql.String)}),
        },
    });
    const AuthenticationResult = graphql.union({
        name: gqlNames.ItemAuthenticationWithVerifyCodeResult,
        types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
        resolveType(val) {
            if ('sessionToken' in val) {
                return gqlNames.ItemAuthenticationWithVerifyCodeSuccess;
            }
            return gqlNames.ItemAuthenticationWithVerifyCodeFailure;
        },
    });

    const ItemSendVerifyCodeSuccess = graphql.object<{message: string}>()({
        name: gqlNames.ItemSendVerifyCodeSuccess,
        fields: {
            message: graphql.field({type: graphql.nonNull(graphql.String)}),
        },
    });
    const ItemSendVerifyCodeFailure = graphql.object<{ message: string }>()({
        name: gqlNames.ItemSendVerifyCodeFailure,
        fields: {
            message: graphql.field({type: graphql.nonNull(graphql.String)}),
        },
    });
    const SendVerifyCodeResult = graphql.union({
        name: gqlNames.ItemSendVerifyCodeResult,
        types: [ItemSendVerifyCodeSuccess, ItemSendVerifyCodeFailure],
        resolveType(val) {
            // if ('code_has_expired' in val)
                if ('code' in val) {
                    return gqlNames.ItemSendVerifyCodeFailure
                }
            return gqlNames.ItemSendVerifyCodeSuccess
        },
    });

    // const SendVerifyResult = graphql.object<{ message: string}>()({
    //     name: gqlNames
    // })

    // @ts-ignore
    const extension = {
        query: {
            authenticatedItem: graphql.field({
                type: graphql.union({
                    name: 'AuthenticatedItem',
                    // @ts-ignore
                    types: [base.object(listKey) as graphql.ObjectType<BaseItem>],
                    // @ts-ignore
                    resolveType: (root, context) => context.session?.listKey,
                }),
                // @ts-ignore
                resolve(root, args, {session, db}) {
                    if (typeof session?.itemId === 'string' && typeof session.listKey === 'string') {
                        return db[session.listKey].findOne({where: {id: session.itemId}});
                    }
                    return null;
                },
            }),
        },
        mutation: {

            [gqlNames.sendItemVerifyCode]: graphql.field({
                type: SendVerifyCodeResult,
                args: {
                    [identityField]: graphql.arg({type: graphql.nonNull(graphql.String)}),
                },
                // @ts-ignore
                async resolve(root,{[identityField]: identity}, context: PickerContext) {
                    const item = await context.query.User.findOne({
                        where: { [identityField]: identity },
                        query: `
                            id
                            verifyCodeCreatedAt
                            verifyCode
                            identifier
                        `
                    })
                    const verifyCode =  generateCode(6)

                    // console.log(item)
                    // const dbItemAPI = context.sudo().db[listKey]
                    // const item = await dbItemAPI.findOne({
                    //     where: {
                    //        [identityField]: identity
                    //     }
                    // })
                    const dbItemAPI = context.sudo().db[listKey]

                    if (!item || !item['verifyCode']) {
                        // @ts-ignore
                        const user = await dbItemAPI.createOne({
                            data: {
                                // name: item.name,
                                identifier: identity,
                                password: identity,
                                verifyCode,
                                verifyCodeCreatedAt: new Date()
                            }
                        })
                        // 发出验证码短信
                        // context.eventBus.publish(new SmsEvent('verification', identity, verifyCode))
                        return {code: 'SUCCESS', message: '验证码已发送'};

                    } else {
                        console.log('检查验证码时效')
                        console.log(item)
                        // 否则检验短信验证码时效
                        const now = Date.now()
                        if (now < (new Date(item['verifyCodeCreatedAt']).getTime() + 1 * 60 * 1000)) {
                            return {code: 'FAILURE', message: '验证码已发送，请稍后重试'};
                        } else {
                            console.log('已过时效可以发短信了。。。。')
                            await dbItemAPI.updateOne({
                                where: {id: item.id},
                                data: {
                                    verifyCode,
                                    verifyCodeCreatedAt: new Date()
                                }
                            })
                            context.eventBus.publish(new SmsEvent('verification',identity , verifyCode))
                        }
                        // if (new Date(item['verifyCodeCreatedAt']).getTime()))
                    }
                    return {code: 'FAILURE', message: '验证码已发送，请稍后重试'};
                }
            }),
            [gqlNames.authenticateItemWithVerifyCode]: graphql.field({
                type: AuthenticationResult,
                args: {
                    [identityField]: graphql.arg({type: graphql.nonNull(graphql.String)}),
                    [secretField]: graphql.arg({type: graphql.nonNull(graphql.String)}),
                },
                // @ts-ignore
                async resolve(root, {[identityField]: identity, [secretField]: secret}, context: PickerContext) {
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
                    })

                   // 如果没有这个用户
                    if (!item) {}
                    const dbItemAPI = context.sudo().db[listKey];

                    const now = Date.now()
                    if (now < (new Date(item['verifyCodeCreatedAt']).getTime() + 10 * 60 * 1000)) {
                        await dbItemAPI.updateOne({
                            where: {id: item.id},
                            data: {
                                verifyCode: '',
                                verifyCodeCreatedAt: new Date()
                            }
                        })
                        return {code: 'FAILURE', message: '验证码已失效，请重新发送验证码'};
                    } else {
                        // compare 验证码
                        const result = {
                            success: false,
                            item
                        }
                        if (secret === item[secretField]) {
                            const sessionToken = await context.startSession({
                                listKey,
                                itemId: result.item.id.toString(),
                            });
                            return {sessionToken, item: result.item};
                        } else {
                            return { code: 'FAILURE', message: '验证失败' }
                        }

                    }

                },
            }),
        },
    };
    return {extension, ItemAuthenticationWithPasswordSuccess};
}
