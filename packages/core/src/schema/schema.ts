import type { GraphQLSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/schema';
import {
    ExtendGraphqlSchema,
    ListConfig,
    SchemaConfig,
    GraphQLSchemaExtension,
    BasePickerTypeInfo,
    BaseFields, BaseListTypeInfo, PickerContext
} from "./types";

export function config<TypeInfo extends BasePickerTypeInfo>(config: SchemaConfig<TypeInfo>) {
    return config;
}

export function list<
    Fields extends BaseFields<ListTypeInfo>,
    ListTypeInfo extends BaseListTypeInfo
    >(config: ListConfig<ListTypeInfo, Fields>): ListConfig<ListTypeInfo, any> {
    return config;
}

export function gql(strings: TemplateStringsArray) {
    return strings[0];
}

export function graphQLSchemaExtension<Context extends PickerContext>({
                                                                            typeDefs,
                                                                            resolvers,
                                                                        }: GraphQLSchemaExtension<Context>): ExtendGraphqlSchema {
    return (schema: GraphQLSchema) => mergeSchemas({ schemas: [schema], typeDefs, resolvers });
}
