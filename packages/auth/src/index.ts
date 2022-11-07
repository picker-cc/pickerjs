import url from 'url';
import {AuthConfig, AuthGqlNames} from "./types";
import {getSchemaExtension} from "./schema";
import {BaseListTypeInfo, password, SchemaConfig, SessionStrategy, timestamp} from "@picker-cc/core";

/**
 * createAuth function
 *
 * Generates config for Picker to implement standard auth features.
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
        // Core
        authenticateItemWithPassword: `authenticate${listKey}WithPassword`,
        ItemAuthenticationWithPasswordResult: `${listKey}AuthenticationWithPasswordResult`,
        ItemAuthenticationWithPasswordSuccess: `${listKey}AuthenticationWithPasswordSuccess`,
        ItemAuthenticationWithPasswordFailure: `${listKey}AuthenticationWithPasswordFailure`,
        // Initial data
        CreateInitialInput: `CreateInitial${listKey}Input`,
        createInitialItem: `createInitial${listKey}`,
        // Password reset
        sendItemPasswordResetLink: `send${listKey}PasswordResetLink`,
        SendItemPasswordResetLinkResult: `Send${listKey}PasswordResetLinkResult`,
        validateItemPasswordResetToken: `validate${listKey}PasswordResetToken`,
        ValidateItemPasswordResetTokenResult: `Validate${listKey}PasswordResetTokenResult`,
        redeemItemPasswordResetToken: `redeem${listKey}PasswordResetToken`,
        RedeemItemPasswordResetTokenResult: `Redeem${listKey}PasswordResetTokenResult`,
        // Magic auth
        sendItemMagicAuthLink: `send${listKey}MagicAuthLink`,
        SendItemMagicAuthLinkResult: `Send${listKey}MagicAuthLinkResult`,
        redeemItemMagicAuthToken: `redeem${listKey}MagicAuthToken`,
        RedeemItemMagicAuthTokenResult: `Redeem${listKey}MagicAuthTokenResult`,
        RedeemItemMagicAuthTokenSuccess: `Redeem${listKey}MagicAuthTokenSuccess`,
        RedeemItemMagicAuthTokenFailure: `Redeem${listKey}MagicAuthTokenFailure`,
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
        passwordResetLink,
        magicAuthLink,
        sessionData,
    });

    /**
     * validateConfig
     *
     * Validates the provided auth config; optional step when integrating auth
     */
    const validateConfig = (schemaConfig: SchemaConfig) => {
        const listConfig = schemaConfig.models[listKey];
        if (listConfig === undefined) {
            const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
            throw new Error(msg);
        }

        // TODO: Check for String-like typing for identityField? How?
        // TODO: Validate that the identifyField is unique.
        // TODO: If this field isn't required, what happens if I try to log in as `null`?
        const identityFieldConfig = listConfig.fields[identityField];
        if (identityFieldConfig === undefined) {
            const i = JSON.stringify(identityField);
            const msg = `A createAuth() invocation for the "${listKey}" list specifies ${i} as its identityField but no field with that key exists on the list.`;
            throw new Error(msg);
        }

        // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
        const secretFieldConfig = listConfig.fields[secretField];
        if (secretFieldConfig === undefined) {
            const s = JSON.stringify(secretField);
            const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
            throw new Error(msg);
        }

        // TODO: Could also validate initFirstItem.itemData keys?
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
     *
     * Automatically extends config with the correct auth functionality. This is the easiest way to
     * configure auth for picker-cc; you should probably use it unless you want to extend or replace
     * the way auth is set up with custom functionality.
     *
     * It validates the auth config against the provided picker-cc config, and preserves existing
     * config by composing existing extendGraphqlSchema functions and ui config.
     */
    const withAuth = (schemaConfig: SchemaConfig): SchemaConfig => {
        validateConfig(schemaConfig);
        // let ui = schemaConfig.ui;
        // if (!schemaConfig.ui?.isDisabled) {
        //     ui = {
        //         ...schemaConfig.ui,
        //         publicPages: [...(schemaConfig.ui?.publicPages || []), ...publicPages],
        //         getAdditionalFiles: [...(schemaConfig.ui?.getAdditionalFiles || []), getAdditionalFiles],
        //         pageMiddleware: async args =>
        //             (await pageMiddleware(args)) ?? schemaConfig?.ui?.pageMiddleware?.(args),
        //         isAccessAllowed: async (context: PickerContext) => {
        //             // Allow access to the adminMeta data from the /init path to correctly render that page
        //             // even if the user isn't logged in (which should always be the case if they're seeing /init)
        //             const headers = context.req?.headers;
        //             const host = headers ? headers['x-forwarded-host'] || headers['host'] : null;
        //             const url = headers?.referer ? new URL(headers.referer) : undefined;
        //             const accessingInitPage =
        //                 url?.pathname === '/init' &&
        //                 url?.host === host &&
        //                 (await context.sudo().query[listKey].count({})) === 0;
        //             return (
        //                 accessingInitPage ||
        //                 (schemaConfig.ui?.isAccessAllowed
        //                     ? schemaConfig.ui.isAccessAllowed(context)
        //                     : context.session !== undefined)
        //             );
        //         },
        //     };
        // }

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
        // In the future we may want to return the following so that developers can
        // roll their own. This is pending a review of the use cases this might be
        // appropriate for, along with documentation and testing.
        // ui: { pageMiddleware, getAdditionalFiles, publicPages },
        // fields,
        // extendGraphqlSchema,
        // validateConfig,
    };
}
