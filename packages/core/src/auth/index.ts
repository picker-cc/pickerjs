// import url from 'url';
import { password, timestamp } from '../schema/fields';
import { AdminFileToWrite, BaseListTypeInfo, PickerContext, SchemaConfig, SessionStrategy } from '../schema/types';
import { AuthConfig, AuthGqlNames } from './types';
import { getSchemaExtension } from './schema';
import { signinTemplate } from './templates/signin';
import { initTemplate } from './templates/init';

/**
 * createAuth function
 *
 * Generates config for Picker to implement standard auth features.
 */
export function createAuth<ListTypeInfo extends BaseListTypeInfo>({
  listKey,
  secretField,
  initFirstItem,
  identityField,
  magicAuthLink,
  passwordResetLink,
  sessionData = 'id'
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
    RedeemItemMagicAuthTokenFailure: `Redeem${listKey}MagicAuthTokenFailure`
  };

  /**
   * fields
   *
   * Fields added to the auth list.
   */
  const fieldConfig = {
    access: () => false,
    ui: {
      createView: { fieldMode: 'hidden' },
      itemView: { fieldMode: 'hidden' },
      listView: { fieldMode: 'hidden' }
    }
  } as const;
  // These field names have to follow this format so that for e.g
  // validateAuthToken() behaves correctly.
  const tokenFields = (tokenType: 'passwordReset' | 'magicAuth') => ({
    [`${tokenType}Token`]: password({ ...fieldConfig }),
    [`${tokenType}IssuedAt`]: timestamp({ ...fieldConfig }),
    [`${tokenType}RedeemedAt`]: timestamp({ ...fieldConfig })
  });
  const fields = {
    ...(passwordResetLink && tokenFields('passwordReset')),
    ...(magicAuthLink && tokenFields('magicAuth'))
  };

  /**
   * getAdditionalFiles
   *
   * This function adds files to be generated into the Admin UI build. Must be added to the
   * ui.getAdditionalFiles config.
   *
   * The signin page is always included, and the init page is included when initFirstItem is set
   */
  const authGetAdditionalFiles = () => {
    const filesToWrite: AdminFileToWrite[] = [
      {
        mode: 'write',
        src: signinTemplate({ gqlNames, identityField, secretField }),
        outputPath: 'pages/signin.js'
      }
    ];
    if (initFirstItem) {
      filesToWrite.push({
        mode: 'write',
        src: initTemplate({ listKey, initFirstItem }),
        outputPath: 'pages/init.js'
      });
    }
    return filesToWrite;
  };

  /**
   * publicAuthPages
   *
   * Must be added to the ui.publicPages config
   */
  const authPublicPages = ['/signin'];

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
    sessionData
  });

  /**
   * validateConfig
   *
   * Validates the provided auth config; optional step when integrating auth
   */
  const validateConfig = (schemaConfig: SchemaConfig) => {
    const listConfig = schemaConfig.lists[listKey];
    if (listConfig === undefined) {
      const msg = `A createAuth() invocation specifies the list "${listKey}" but no list with that key has been defined.`;
      throw new Error(msg);
    }
    // eslint-disable-next-line no-warning-comments
    // TODO: Check for String-like typing for identityField? How?
    // eslint-disable-next-line no-warning-comments
    // TODO: Validate that the identifyField is unique.
    // eslint-disable-next-line no-warning-comments
    // TODO: If this field isn't required, what happens if I try to log in as `null`?
    const identityFieldConfig = listConfig.fields[identityField];
    if (identityFieldConfig === undefined) {
      const i = JSON.stringify(identityField);
      const msg = `A createAuth() invocation for the "${listKey}" list specifies ${i} as its identityField but no field with that key exists on the list.`;
      throw new Error(msg);
    }
    // eslint-disable-next-line no-warning-comments
    // TODO: We could make the secret field optional to disable the standard id/secret auth and password resets (ie. magic links only)
    const secretFieldConfig = listConfig.fields[secretField];
    if (secretFieldConfig === undefined) {
      const s = JSON.stringify(secretField);
      const msg = `A createAuth() invocation for the "${listKey}" list specifies ${s} as its secretField but no field with that key exists on the list.`;
      throw new Error(msg);
    }

    // eslint-disable-next-line no-warning-comments
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
  // eslint-disable-next-line no-warning-comments
  /* TODO:
      - [ ] We could support additional where input to validate item sessions (e.g an isEnabled boolean)
    */
  const withItemData = (
    _sessionStrategy: SessionStrategy<Record<string, any>>
  ): SessionStrategy<{ listKey: string; itemId: string; data: any }> => {
    const { get, ...sessionStrategy } = _sessionStrategy;
    return {
      ...sessionStrategy,
      get: async ({ context }) => {
        const session = await get({ context });
        // const sudoContext = createContext({ sudo: true });
        const sudoContext = context.sudo();

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
            where: { id: session.itemId },
            query: sessionData
          });
          if (!data) return;

          // eslint-disable-next-line consistent-return
          return { ...session, itemId: session.itemId, listKey, data };
        } catch (e) {
          // eslint-disable-next-line no-warning-comments
          // TODO: the assumption is this should only be from an invalid sessionData configuration
          //   it could be something else though, either way, result is a bad session
        }
      }
    };
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function defaultIsAccessAllowed({ session }: PickerContext) {
    return session !== undefined;
  }
  async function hasInitFirstItemConditions(context: PickerContext) {
    // do nothing if they aren't using this feature
    if (!initFirstItem) return false;

    // if they have a session, there is no initialisation necessary
    if (context.session) return false;

    const count = await context.sudo().db[listKey].count({});
    return count === 0;
  }
  async function authMiddleware({
    context,
    isValidSession: wasAccessAllowed
  }: {
    context: PickerContext;
    // eslint-disable-next-line no-warning-comments
    isValidSession: boolean; // TODO: rename "isValidSession" to "wasAccessAllowed"?
  }): Promise<{ kind: 'redirect'; to: string } | void> {
    const { req } = context;
    const { pathname } = new URL(req!.url!, 'http://_');

    // redirect to init if initFirstItem conditions are met
    if (pathname !== '/init' && (await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: '/init' };
    }

    // redirect to / if attempting to /init and initFirstItem conditions are not met
    if (pathname === '/init' && !(await hasInitFirstItemConditions(context))) {
      return { kind: 'redirect', to: '/' };
    }

    // don't redirect if we have access
    // eslint-disable-next-line consistent-return
    if (wasAccessAllowed) return;

    // otherwise, redirect to signin
    if (pathname === '/') return { kind: 'redirect', to: '/signin' };
    return {
      kind: 'redirect',
      to: `/signin?from=${encodeURIComponent(req!.url!)}`
    };
  }
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

    let { ui } = schemaConfig;
    if (!ui?.isDisabled) {
      const {
        getAdditionalFiles = [],
        isAccessAllowed = defaultIsAccessAllowed,
        pageMiddleware,
        publicPages = []
      } = ui || {};
      ui = {
        ...ui,
        publicPages: [...publicPages, ...authPublicPages],
        getAdditionalFiles: [...getAdditionalFiles, authGetAdditionalFiles],

        isAccessAllowed: async (context: PickerContext) => {
          if (await hasInitFirstItemConditions(context)) return true;
          return isAccessAllowed(context);
        },

        pageMiddleware: async args => {
          const shouldRedirect = await authMiddleware(args);
          if (shouldRedirect) return shouldRedirect;
          return pageMiddleware?.(args);
        }
      };
    }
    if (!schemaConfig.session) throw new TypeError('缺少 .session 配置');
    const session = withItemData(schemaConfig.session);

    const existingExtendGraphQLSchema = schemaConfig.extendGraphqlSchema;
    const listConfig = schemaConfig.lists[listKey];
    return {
      ...schemaConfig,
      ui,
      session,
      lists: {
        ...schemaConfig.lists,
        [listKey]: { ...listConfig, fields: { ...listConfig.fields, ...fields } }
      },
      extendGraphqlSchema: existingExtendGraphQLSchema
        ? schema => existingExtendGraphQLSchema(extendGraphqlSchema(schema))
        : extendGraphqlSchema
    };
  };

  return {
    withAuth
  };
}
