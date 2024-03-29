import { AuthGqlNames, SecretFieldImpl } from '../types';
import { validateSecret } from '../lib/validateSecret';
import { BaseItem } from '../../schema/types';
import { graphql } from '../../schema';

export function getBaseAuthSchema<I extends string, S extends string>({
  listKey,
  identityField,
  secretField,
  gqlNames,
  secretFieldImpl,
  base
}: {
  listKey: string;
  identityField: I;
  secretField: S;
  gqlNames: AuthGqlNames;
  secretFieldImpl: SecretFieldImpl;
  base: graphql.BaseSchemaMeta;
}) {
  const ItemAuthenticationWithPasswordSuccess = graphql.object<{
    sessionToken: string;
    item: BaseItem;
  }>()({
    name: gqlNames.ItemAuthenticationWithPasswordSuccess,
    fields: {
      sessionToken: graphql.field({ type: graphql.nonNull(graphql.String) }),
      item: graphql.field({ type: graphql.nonNull(base.object(listKey)) })
    }
  });
  const ItemAuthenticationWithPasswordFailure = graphql.object<{ message: string }>()({
    name: gqlNames.ItemAuthenticationWithPasswordFailure,
    fields: {
      message: graphql.field({ type: graphql.nonNull(graphql.String) })
    }
  });
  const AuthenticationResult = graphql.union({
    name: gqlNames.ItemAuthenticationWithPasswordResult,
    types: [ItemAuthenticationWithPasswordSuccess, ItemAuthenticationWithPasswordFailure],
    resolveType(val) {
      if ('sessionToken' in val) {
        return gqlNames.ItemAuthenticationWithPasswordSuccess;
      }
      return gqlNames.ItemAuthenticationWithPasswordFailure;
    }
  });
  const extension = {
    query: {
      authenticatedItem: graphql.field({
        type: graphql.union({
          name: 'AuthenticatedItem',
          types: [base.object(listKey) as graphql.ObjectType<BaseItem>],
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolveType: (root, context) => context.session?.listKey
        }),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        resolve(root, args, { session, db }) {
          if (typeof session?.itemId === 'string' && typeof session.listKey === 'string') {
            return db[session.listKey].findOne({ where: { id: session.itemId } });
          }

          return null;
        }
      })
    },
    mutation: {
      [gqlNames.authenticateItemWithPassword]: graphql.field({
        type: AuthenticationResult,
        args: {
          [identityField]: graphql.arg({ type: graphql.nonNull(graphql.String) }),
          [secretField]: graphql.arg({ type: graphql.nonNull(graphql.String) })
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async resolve(root, { [identityField]: identity, [secretField]: secret }, context) {
          if (!context.sessionStrategy) {
            throw new Error('No session implementation available on context');
          }

          const dbItemAPI = context.sudo().db[listKey];
          const result = await validateSecret(secretFieldImpl, identityField, identity, secretField, secret, dbItemAPI);

          if (!result.success) {
            return { code: 'FAILURE', message: 'Authentication failed.' };
          }

          // Update system state
          const sessionToken = (await context.sessionStrategy.start({
            data: {
              listKey,
              itemId: result.item.id.toString()
            },
            context
          })) as string;
          return { sessionToken, item: result.item };
        }
      })
    }
  };
  return { extension, ItemAuthenticationWithPasswordSuccess };
}
