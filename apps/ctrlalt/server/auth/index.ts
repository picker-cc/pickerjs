import url from 'url';
import {AuthConfig, AuthGqlNames} from "./types";
import {getSchemaExtension} from "./schema";
import {BaseListTypeInfo, password, SchemaConfig, SessionStrategy, timestamp} from "@picker-cc/core";

/**
 * createAuth 函数
 *
 * 为 Picker 生成配置，以实现身份验证功能
 */
export function createAuth<ListTypeInfo extends BaseListTypeInfo>
({
     listKey,
     secretField,
     initFirstItem,
     identityField,
     magicAuthLink,
     passwordResetLink,
     sessionData = 'id',
 }: AuthConfig<ListTypeInfo>) {
    const gqlNames: AuthGqlNames = {
        sendItemVerifyCode: `send${listKey}VerifyCode`,
        ItemSendVerifyCodeResult: `send${listKey}VerifyCodeResult`,
        ItemSendVerifyCodeSuccess: `${listKey}SendVerifyCodeSuccess`,
        ItemSendVerifyCodeFailure: `${listKey}SendVerifyCodeFailure`,
        // Core
        authenticateItemWithVerifyCode: `authenticate${listKey}WithVerifyCode`,
        ItemAuthenticationWithVerifyCodeResult: `${listKey}AuthenticationWithVerifyCodeResult`,
        ItemAuthenticationWithVerifyCodeSuccess: `${listKey}AuthenticationWithVerifyCodeSuccess`,
        ItemAuthenticationWithVerifyCodeFailure: `${listKey}AuthenticationWithVerifyCodeFailure`,
        // Initial data
        CreateInitialInput: `CreateInitial${listKey}Input`,
        createInitialItem: `createInitial${listKey}`
    };

    /**
     * fields
     *
     * Fields added to the auth list.
     */
    const fieldConfig = {
        access: () => false,
        ui: {
            createView: {fieldMode: 'hidden'},
            itemView: {fieldMode: 'hidden'},
            listView: {fieldMode: 'hidden'},
        },
    } as const;
    // These field names have to follow this format so that for e.g
    // validateAuthToken() behaves correctly.
    const tokenFields = (tokenType: 'passwordReset' | 'magicAuth') => ({
        [`${tokenType}Token`]: password({...fieldConfig}),
        [`${tokenType}IssuedAt`]: timestamp({...fieldConfig}),
        [`${tokenType}RedeemedAt`]: timestamp({...fieldConfig}),
    });
    const fields = {
        ...(passwordResetLink && tokenFields('passwordReset')),
        ...(magicAuthLink && tokenFields('magicAuth')),
    };


    /**
     * publicAuthPages
     *
     * Must be added to the ui.publicPages config
     */
    const publicPages = ['/signin'];
    if (initFirstItem) {
        publicPages.push('/init');
    }

    /**
     * extendGraphqlSchema
     *
     * Must be added to the extendGraphqlSchema config. Can be composed.
     */
    const extendGraphqlSchema = getSchemaExtension({
        identityField,
        listKey,
        secretField,
        gqlNames,
        initFirstItem,
        sessionData,
    });

    /**
     * validateConfig
     * 为验证提供的认证配置，集成认证时可选
     */
    const validateConfig = (schemaConfig: SchemaConfig) => {
        const listConfig = schemaConfig.models[listKey];
        if (listConfig === undefined) {
            const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
            throw new Error(msg);
        }

        // TODO: 检查字符串类型的 identityField
        // TODO: 验证 identifyField 是唯一的
        // TODO: 如果这个字段不需要，如果我试图登录为 null 会发生什么
        const identityFieldConfig = listConfig.fields[identityField];
        if (identityFieldConfig === undefined) {
            const i = JSON.stringify(identityField);
            const msg = `对 "${listKey} 列表的 createAuth() 调用用指定 ${i} 作为其 identityField，但列表中不存在具有该键的字段"`
            // const msg = `A createAuth() invocation for the "${listKey}" list specifies ${i} as its identityField but no field with that key exists on the list.`;
            throw new Error(msg);
        }

        // TODO:我们可以使secret字段可选，以禁用标准的id/secret认证和密码重置(例如。神奇的链接)
        const secretFieldConfig = listConfig.fields[secretField];
        if (secretFieldConfig === undefined) {
            const s = JSON.stringify(secretField);
            const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
            throw new Error(msg);
        }

        // TODO:也可以验证initFirstItem。itemData key?
        for (const field of initFirstItem?.fields || []) {
            if (listConfig.fields[field] === undefined) {
                const f = JSON.stringify(field);
                const msg = `A createAuth() invocation for the "${listKey}" list specifies the field ${f} in initFirstItem.fields array but no field with that key exist on the list.`;
                throw new Error(msg);
            }
        }
    };

    /**
     * withItemData
     *
     * Automatically injects a session.data value with the authenticated item
     * 自动注入会话。带有身份验证项的数据值
     */
    /* TODO:
      - [ ] We could support additional where input to validate item sessions (e.g an isEnabled boolean)
    */
    const withItemData = (
        _sessionStrategy: SessionStrategy<Record<string, any>>
    ): SessionStrategy<{ listKey: string; itemId: string; data: any }> => {
        const {get, ...sessionStrategy} = _sessionStrategy;
        return {
            ...sessionStrategy,
            get: async ({req, createContext}) => {
                const session = await get({req, createContext});
                const sudoContext = createContext({sudo: true});
                if (
                    !session ||
                    !session.listKey ||
                    session.listKey !== listKey ||
                    !session.itemId ||
                    !sudoContext.query[session.listKey]
                ) {
                    return;
                }

                try {
                    const data = await sudoContext.query[listKey].findOne({
                        where: {id: session.itemId},
                        query: sessionData,
                    });
                    if (!data) return;

                    return {...session, itemId: session.itemId, listKey, data};
                } catch (e) {
                    // TODO: the assumption is this should only be from an invalid sessionData configuration
                    //   it could be something else though, either way, result is a bad session
                    return;
                }
            },
        };
    };

    /**
     * withAuth
     * 使用正确的身份验证功能自动扩展配置。这是配置 picker-cc 认证的最简单的方法以；除非您想扩展或替换它，否则您应该使用它自定义功能设置认证的方式。
     *
     * 它根据提供的 picker-cc 配置验证认证配置，并通过组合现有的 extendGraphqlSchema 函数和 ui 配置来保留现有的配置。
     */
    const withAuth = (schemaConfig: SchemaConfig): SchemaConfig => {
        validateConfig(schemaConfig);

        if (!schemaConfig.session) throw new TypeError('Missing .session configuration');
        const session = withItemData(schemaConfig.session);

        const existingExtendGraphQLSchema = schemaConfig.extendGraphqlSchema;
        const listConfig = schemaConfig.models[listKey];
        return {
            ...schemaConfig,
            // ui,
            session,
            // Add the additional fields to the references lists fields object
            // TODO: The fields we're adding here shouldn't naively replace existing fields with the same key
            // Leaving existing fields in place would allow solution devs to customise these field defs (eg. access control,
            // work factor for the tokens, etc.) without abandoning the withAuth() interface
            models: {
                ...schemaConfig.models,
                [listKey]: {...listConfig, fields: {...listConfig.fields, ...fields}},
            },
            extendGraphqlSchema: existingExtendGraphQLSchema
                ? schema => existingExtendGraphQLSchema(extendGraphqlSchema(schema))
                : extendGraphqlSchema,
        };
    };

    return {
        withAuth,
    };
}
