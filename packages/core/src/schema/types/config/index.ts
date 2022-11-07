import type { Config } from 'apollo-server-express';
import { CorsOptions } from 'cors';
import type { Options as BodyParserOptions } from 'body-parser';
import {PickerContext} from "../picker-context";
import {DatabaseProvider} from "../../prisma/prisma-schema";
import {GraphQLSchema} from "graphql";
import {BaseListTypeInfo, BasePickerTypeInfo} from "../type-info";
import type { BaseFields } from './fields';
import type {ListAccessControl, FieldAccessControl} from "../../core/access-control";
import {ListHooks} from "./hooks";
import {SessionStrategy} from "../session";
import type {
    ListSchemaConfig,
    ListConfig,
    MaybeSessionFunction,
    MaybeItemFunction,
    IdFieldConfig,
} from './lists';

export type GraphQLConfig = {
    // The path of the GraphQL API endpoint. Default: '/api/graphql'.
    path?: string;
    // The CORS configuration to use on the GraphQL API endpoint.
    // Default: { origin: 'https://studio.apollographql.com', credentials: true }
    cors?: CorsOptions;
    bodyParser?: BodyParserOptions;
    queryLimits?: {
        maxTotalResults?: number;
    };
    /**
     * - `true` - Add `ApolloServerPluginLandingPageGraphQLPlayground` to the Apollo Server plugins
     * - `false` - Add `ApolloServerPluginLandingPageDisabled` to the Apollo Server plugins
     * - `'apollo'` - Do not add any plugins to the Apollo config, this will use [Apollo Sandbox](https://www.apollographql.com/docs/apollo-server/testing/build-run-queries/#apollo-sandbox)
     * @default process.env.NODE_ENV !== 'production'
     */
    playground?: boolean | 'apollo';
    /**
     *  Additional options to pass into the ApolloServer constructor.
     *  @see https://www.apollographql.com/docs/apollo-server/api/apollo-server/#constructor
     */
    apolloConfig?: Config;
    /**
     * When an error is returned from the GraphQL API, Apollo can include a stacktrace
     * indicating where the error occurred. When Keystone is processing mutations, it
     * will sometimes captures more than one error at a time, and then group these into
     * a single error returned from the GraphQL API. Each of these errors will include
     * a stacktrace.
     *
     * In general both categories of stacktrace are useful for debugging while developing,
     * but should not be exposed in production, and this is the default behaviour of Keystone.
     *
     * You can use the `debug` option to change this behaviour. A use case for this
     * would be if you need to send the stacktraces to a log, but do not want to return them
     * from the API. In this case you could set `debug: true` and use
     * `apolloConfig.formatError` to log the stacktraces and then strip them out before
     * returning the error.
     *
     * ```ts
     * graphql: {
     *   debug: true,
     *   apolloConfig: {
     *     formatError: err => {
     *       console.error(err);
     *       delete err.extensions?.errors;
     *       delete err.extensions?.exception?.errors;
     *       delete err.extensions?.exception?.stacktrace;
     *       return err;
     *     },
     *   },
     * }
     * ```
     *
     * @default process.env.NODE_ENV !== 'production'
     */
    debug?: boolean;
};
export type ExtendGraphqlSchema = (schema: GraphQLSchema) => GraphQLSchema;

// config.lists
export type { ListSchemaConfig, ListConfig, BaseFields, MaybeSessionFunction, MaybeItemFunction };

// config.db

export type DatabaseConfig<TypeInfo extends BasePickerTypeInfo  > = {
    url: string;
    shadowDatabaseUrl?: string;
    onConnect?: (args: PickerContext<TypeInfo>) => Promise<void>;
    useMigrations?: boolean;
    enableLogging?: boolean;
    idField?: IdFieldConfig;
    provider: DatabaseProvider;
    prismaPreviewFeatures?: readonly string[]; // https://www.prisma.io/docs/concepts/components/preview-features
    additionalPrismaDatasourceProperties?: { [key: string]: string };
};

export type SchemaConfig<TypeInfo extends BasePickerTypeInfo = BasePickerTypeInfo> = {
    models: ListSchemaConfig;
    db: DatabaseConfig<TypeInfo>;
    ui?: any;
    server?: any;
    session?: SessionStrategy<any>;
    graphql?: GraphQLConfig;
    extendGraphqlSchema?: ExtendGraphqlSchema;
    storage?: any;
    experimental?: {
        /** 创建一个带有 `lists` export 的文件 `node_modules/.picker-cc/api`*/
        generateNodeAPI?: boolean;
    };
}

// Exports from sibling packages

export type { ListHooks, ListAccessControl, FieldAccessControl };

export type {
    FieldCreateItemAccessArgs,
    FieldReadItemAccessArgs,
    FieldUpdateItemAccessArgs,
    IndividualFieldAccessControl,
    CreateListItemAccessControl,
    UpdateListItemAccessControl,
    DeleteListItemAccessControl,
    ListOperationAccessControl,
    ListFilterAccessControl,
} from '../../core/access-control';

export type { CommonFieldConfig } from './fields';
export type { CacheHintArgs, IdFieldConfig } from './lists';
