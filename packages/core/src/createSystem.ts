import pLimit from 'p-limit';
import { FieldData, getGqlNames, SchemaConfig } from './schema/types';
import { PrismaModule } from './schema/artifacts';
import { setPrismaNamespace, setWriteLimit } from './schema/utils';
import { makeCreateContext } from './schema/context/createContext';
import { initialiseLists } from './schema/types-for-lists';
import { createAdminMeta } from './admin-ui/system/createAdminMeta';
import { createGraphQLSchema } from './schema/createGraphQLSchema';

function getSudoGraphQLSchema(config: SchemaConfig) {
  // This function creates a GraphQLSchema based on a modified version of the provided config.
  // The modifications are:
  //  * All list level access control is disabled
  //  * All field level access control is disabled
  //  * All graphql.omit configuration is disabled
  //  * All fields are explicitly made filterable and orderable
  //
  // These changes result in a schema without any restrictions on the CRUD
  // operations that can be run.
  //
  // The resulting schema is used as the GraphQL schema when calling `context.sudo()`.
  const transformedConfig: SchemaConfig = {
    ...config,
    ui: {
      ...config.ui,
      isAccessAllowed: () => true
    },
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: () => true,
            graphql: { ...(list.graphql || {}), omit: [] },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                if (fieldKey.startsWith('__group')) return [fieldKey, field];
                return [
                  fieldKey,
                  (data: FieldData) => {
                    const f = field(data);
                    return {
                      ...f,
                      access: () => true,
                      isFilterable: true,
                      isOrderable: true,
                      graphql: { ...(f.graphql || {}), omit: [] }
                    };
                  }
                ];
              })
            )
          }
        ];
      })
    )
  };
  const lists = initialiseLists(transformedConfig);
  const adminMeta = createAdminMeta(transformedConfig, lists);
  return createGraphQLSchema(transformedConfig, lists, adminMeta);
}

export function createSystem(config: SchemaConfig) {
  const lists = initialiseLists(config);

  const adminMeta = createAdminMeta(config, lists);

  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta);

  const sudoGraphQLSchema = getSudoGraphQLSchema(config);

  return {
    graphQLSchema,
    adminMeta,
    getPicker: (prismaModule: PrismaModule) => {
      const prismaClient = new prismaModule.PrismaClient({
        log: config.db.enableLogging ? ['query'] : undefined,
        datasources: { [config.db.provider]: { url: config.db.url } }
      });

      setWriteLimit(prismaClient, pLimit(config.db.provider === 'sqlite' ? 1 : Infinity));
      setPrismaNamespace(prismaClient, prismaModule.Prisma);
      prismaClient.$on('beforeExit', async () => {
        // Prisma is failing to properly clean up its child processes
        // https://github.com/picker-cc/pickerjs/issues/5477
        // We explicitly send a SIGINT signal to the prisma child process on exit
        // to ensure that the process is cleaned up appropriately.
        // eslint-disable-next-line no-underscore-dangle
        prismaClient._engine.child?.kill('SIGINT');
      });

      const context = makeCreateContext({
        graphQLSchema,
        sudoGraphQLSchema,
        config,
        prismaClient,
        gqlNamesByList: Object.fromEntries(
          Object.entries(lists).map(([listKey, list]) => [listKey, getGqlNames(list)])
        ),
        lists
        // eventBus,
        // injector,
      });

      return {
        async connect() {
          await prismaClient.$connect();
          await config.db.onConnect?.(context);
        },
        async disconnect() {
          await prismaClient.$disconnect();
        },
        context
      };
    }
  };
}
