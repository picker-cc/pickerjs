import { AdminMetaRootVal } from '../admin-ui/system/createAdminMeta';
import { PickerMeta } from '../admin-ui/system';
import { graphql } from './types/schema';
import { getGraphQLSchema } from './core/graphql-schema';
import { InitialisedList } from './types-for-lists';
import { SchemaConfig } from './types';

export function createGraphQLSchema(
  config: SchemaConfig,
  lists: Record<string, InitialisedList>,
  adminMeta: AdminMetaRootVal
) {
  // Start with the core keystone graphQL schema
  let graphQLSchema = getGraphQLSchema(lists, {
    mutation: config.session
      ? {
          endSession: graphql.field({
            type: graphql.nonNull(graphql.Boolean),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async resolve(rootVal, args, context) {
              if (context.sessionStrategy) {
                await context.sessionStrategy.end({ context });
              }
              return true;
            }
          })
        }
      : {},
    query: {
      keystone: graphql.field({
        type: graphql.nonNull(PickerMeta),
        resolve: () => ({ adminMeta })
      })
    }
  });

  // Merge in the user defined graphQL API
  if (config.extendGraphqlSchema) {
    graphQLSchema = config.extendGraphqlSchema(graphQLSchema);
  }

  return graphQLSchema;
}
