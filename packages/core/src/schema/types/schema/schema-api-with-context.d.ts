import { GraphQLSchemaAPIWithContext } from '@graphql-ts/schema';
import { Context } from './graphql-ts-schema';

// eslint-disable-next-line no-underscore-dangle
declare const __graphql: GraphQLSchemaAPIWithContext<Context>;
export = __graphql;
