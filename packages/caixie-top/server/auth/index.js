"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuth = void 0;
const schema_1 = require("./schema");
const core_1 = require("@picker-cc/core");
function createAuth({ listKey, secretField, initFirstItem, identityField, magicAuthLink, passwordResetLink, sessionData = 'id', }) {
    const gqlNames = {
        sendItemVerifyCode: `send${listKey}VerifyCode`,
        ItemSendVerifyCodeResult: `send${listKey}VerifyCodeResult`,
        ItemSendVerifyCodeSuccess: `${listKey}SendVerifyCodeSuccess`,
        ItemSendVerifyCodeFailure: `${listKey}SendVerifyCodeFailure`,
        authenticateItemWithVerifyCode: `authenticate${listKey}WithVerifyCode`,
        ItemAuthenticationWithVerifyCodeResult: `${listKey}AuthenticationWithVerifyCodeResult`,
        ItemAuthenticationWithVerifyCodeSuccess: `${listKey}AuthenticationWithVerifyCodeSuccess`,
        ItemAuthenticationWithVerifyCodeFailure: `${listKey}AuthenticationWithVerifyCodeFailure`,
        CreateInitialInput: `CreateInitial${listKey}Input`,
        createInitialItem: `createInitial${listKey}`
    };
    const fieldConfig = {
        access: () => false,
        ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'hidden' },
            listView: { fieldMode: 'hidden' },
        },
    };
    const tokenFields = (tokenType) => ({
        [`${tokenType}Token`]: (0, core_1.password)({ ...fieldConfig }),
        [`${tokenType}IssuedAt`]: (0, core_1.timestamp)({ ...fieldConfig }),
        [`${tokenType}RedeemedAt`]: (0, core_1.timestamp)({ ...fieldConfig }),
    });
    const fields = {
        ...(passwordResetLink && tokenFields('passwordReset')),
        ...(magicAuthLink && tokenFields('magicAuth')),
    };
    const publicPages = ['/signin'];
    if (initFirstItem) {
        publicPages.push('/init');
    }
    const extendGraphqlSchema = (0, schema_1.getSchemaExtension)({
        identityField,
        listKey,
        secretField,
        gqlNames,
        initFirstItem,
        sessionData,
    });
    const validateConfig = (schemaConfig) => {
        const listConfig = schemaConfig.models[listKey];
        if (listConfig === undefined) {
            const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
            throw new Error(msg);
        }
        const identityFieldConfig = listConfig.fields[identityField];
        if (identityFieldConfig === undefined) {
            const i = JSON.stringify(identityField);
            const msg = `对 "${listKey} 列表的 createAuth() 调用用指定 ${i} 作为其 identityField，但列表中不存在具有该键的字段"`;
            throw new Error(msg);
        }
        const secretFieldConfig = listConfig.fields[secretField];
        if (secretFieldConfig === undefined) {
            const s = JSON.stringify(secretField);
            const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
            throw new Error(msg);
        }
        for (const field of initFirstItem?.fields || []) {
            if (listConfig.fields[field] === undefined) {
                const f = JSON.stringify(field);
                const msg = `A createAuth() invocation for the "${listKey}" list specifies the field ${f} in initFirstItem.fields array but no field with that key exist on the list.`;
                throw new Error(msg);
            }
        }
    };
    const withItemData = (_sessionStrategy) => {
        const { get, ...sessionStrategy } = _sessionStrategy;
        return {
            ...sessionStrategy,
            get: async ({ req, createContext }) => {
                const session = await get({ req, createContext });
                const sudoContext = createContext({ sudo: true });
                if (!session ||
                    !session.listKey ||
                    session.listKey !== listKey ||
                    !session.itemId ||
                    !sudoContext.query[session.listKey]) {
                    return;
                }
                try {
                    const data = await sudoContext.query[listKey].findOne({
                        where: { id: session.itemId },
                        query: sessionData,
                    });
                    if (!data)
                        return;
                    return { ...session, itemId: session.itemId, listKey, data };
                }
                catch (e) {
                    return;
                }
            },
        };
    };
    const withAuth = (schemaConfig) => {
        validateConfig(schemaConfig);
        if (!schemaConfig.session)
            throw new TypeError('Missing .session configuration');
        const session = withItemData(schemaConfig.session);
        const existingExtendGraphQLSchema = schemaConfig.extendGraphqlSchema;
        const listConfig = schemaConfig.models[listKey];
        return {
            ...schemaConfig,
            session,
            models: {
                ...schemaConfig.models,
                [listKey]: { ...listConfig, fields: { ...listConfig.fields, ...fields } },
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
exports.createAuth = createAuth;
//# sourceMappingURL=index.js.map