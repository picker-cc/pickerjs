import type { IncomingMessage } from 'http';
import { ServerResponse } from 'http';
import { ExecutionResult, graphql, GraphQLSchema, print } from 'graphql';
import { PickerContext, PickerGraphQLAPI, SchemaConfig } from '../types';
import { GqlNames } from '../types/utils';
import { EventBus } from '../../event-bus';
import { Injector } from '../../common';
import { InitialisedList } from '../types-for-lists';
import { PrismaClient } from '../utils';
import { getDbAPIFactory, itemAPIForList } from './itemAPI';

export function makeCreateContext({
  graphQLSchema,
  sudoGraphQLSchema,
  prismaClient,
  gqlNamesByList,
  config,
  lists,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventBus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  injector
}: {
  graphQLSchema: GraphQLSchema;
  sudoGraphQLSchema: GraphQLSchema;
  config: SchemaConfig;
  prismaClient: PrismaClient;
  gqlNamesByList: Record<string, GqlNames>;
  lists: Record<string, InitialisedList>;
  eventBus?: EventBus;
  injector?: Injector;
}) {
  // const images = createImagesContext(config);
  // const files = createFilesContext(config);
  // We precompute these helpers here rather than every time createContext is called
  // because they involve creating a new GraphQLSchema, creating a GraphQL document AST(programmatically, not by parsing) and validating the
  // note this isn't as big of an optimisation as you would imagine(at least in comparison with the rest of the system),
  // the regular non-db lists api does more expensive things on every call
  // like parsing the generated GraphQL document, and validating it against the schema on _every_ call
  // is that really that bad? no not really. this has just been more optimised because the cost of what it's
  // doing is more obvious(even though in reality it's much smaller than the alternative)

  const publicDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, gqlNames] of Object.entries(gqlNamesByList)) {
    publicDbApiFactories[listKey] = getDbAPIFactory(gqlNames, graphQLSchema);
  }

  const sudoDbApiFactories: Record<string, ReturnType<typeof getDbAPIFactory>> = {};
  for (const [listKey, gqlNames] of Object.entries(gqlNamesByList)) {
    sudoDbApiFactories[listKey] = getDbAPIFactory(gqlNames, sudoGraphQLSchema);
  }

  const createContext = ({
    // eslint-disable-next-line @typescript-eslint/no-shadow
    session,
    sudo = false,
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    eventBus,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    injector
  }: // sessionContext,
  {
    session?: any;
    sudo?: boolean;
    req?: IncomingMessage;
    res?: ServerResponse;
    eventBus?: EventBus;
    injector?: Injector;
  } = {}): PickerContext => {
    const schema = sudo ? sudoGraphQLSchema : graphQLSchema;

    const rawGraphQL: PickerGraphQLAPI['raw'] = ({ query, variables }) => {
      const source = typeof query === 'string' ? query : print(query);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return Promise.resolve(
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        graphql({ schema, source, contextValue: contextToReturn, variableValues: variables }) as ExecutionResult<any>
      );
    };
    const runGraphQL: PickerGraphQLAPI['run'] = async ({ query, variables }) => {
      const result = await rawGraphQL({ query, variables });
      if (result.errors?.length) {
        throw result.errors[0];
      }
      // return result.data as Record<string, any>;
      return result.data as any;
    };

    // eslint-disable-next-line @typescript-eslint/no-shadow
    async function withRequest(req: IncomingMessage, res?: ServerResponse) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      contextToReturn.req = req;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      contextToReturn.res = res;
      if (!config.session) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return contextToReturn;
      }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define,require-atomic-updates
      contextToReturn.session = await config.session.get({ context: contextToReturn });
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return createContext({ session: contextToReturn.session, sudo, req, res, eventBus, injector });
    }

    const dbAPI: PickerContext['db'] = {};
    const itemAPI: PickerContext['query'] = {};
    const contextToReturn: PickerContext = {
      db: dbAPI,
      query: itemAPI,
      prisma: prismaClient,
      graphql: { raw: rawGraphQL, run: runGraphQL, schema },
      sessionStrategy: config.session,
      sudo: () =>
        createContext({
          // sessionContext,
          eventBus,
          injector,
          sudo: true,
          req,
          res
        }),
      exitSudo: () =>
        createContext({
          // sessionContext,
          eventBus,
          injector,
          sudo: false,
          req,
          res
        }),
      // eslint-disable-next-line @typescript-eslint/no-shadow
      withSession: session => {
        return createContext({ session, sudo, req, res });
      },
      req,
      eventBus,
      injector,
      session,
      withRequest,
      // ...sessionContext,
      // Note: This field lets us use the server-side-graphql-client library.
      // We may want to remove it once the updated itemAPI w/ query is available.
      gqlNames: (listKey: string) => gqlNamesByList[listKey]
      // images,
      // files,
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (config.experimental?.contextInitialisedLists) {
      contextToReturn.experimental = { initialisedLists: lists };
    }

    const dbAPIFactories = sudo ? sudoDbApiFactories : publicDbApiFactories;
    for (const listKey of Object.keys(gqlNamesByList)) {
      dbAPI[listKey] = dbAPIFactories[listKey](contextToReturn);
      itemAPI[listKey] = itemAPIForList(listKey, contextToReturn);
    }
    return contextToReturn;
  };

  return createContext();
}
