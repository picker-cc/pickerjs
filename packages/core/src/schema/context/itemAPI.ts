import {GraphQLSchema, OperationTypeNode} from 'graphql';

import {executeGraphQLFieldToRootVal} from './executeGraphQLFieldToRootVal';
import {executeGraphQLFieldWithSelection} from './executeGraphQLFieldWithSelection';
import {BaseListTypeInfo, GqlNames, PickerContext, PickerDbAPI, PickerListsAPI} from "../types";

// this is generally incorrect because types are open in TS but is correct in the specific usage here.
// (i mean it's not really any more incorrect than TS is generally is but let's ignore that)
const objectEntriesButUsingKeyof: <T extends Record<string, any>>(
  obj: T
) => [keyof T, T[keyof T]][] = Object.entries as any;

export function getDbAPIFactory(
  gqlNames: GqlNames,
  schema: GraphQLSchema
): (context: PickerContext) => PickerDbAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: OperationTypeNode.QUERY | OperationTypeNode.MUTATION, fieldName: string) => {
    const rootType = operation === OperationTypeNode.MUTATION ? schema.getMutationType()! : schema.getQueryType()!;
    const field = rootType.getFields()[fieldName];

    if (field === undefined) {
      return (): never => {
        // This will be triggered if the field is missing due to `omit` configuration.
        // The GraphQL equivalent would be a bad user input error.
        throw new Error(`This ${operation} is not supported by the GraphQL schema: ${fieldName}()`);
      };
    }

    return executeGraphQLFieldToRootVal(field);
  };
  const api = {
    findOne: f(OperationTypeNode.QUERY, gqlNames.itemQueryName),
    findMany: f(OperationTypeNode.QUERY, gqlNames.listQueryName),
    count: f(OperationTypeNode.QUERY, gqlNames.listQueryCountName),
    createOne: f(OperationTypeNode.MUTATION, gqlNames.createMutationName),
    createMany: f(OperationTypeNode.MUTATION, gqlNames.createManyMutationName),
    updateOne: f(OperationTypeNode.MUTATION, gqlNames.updateMutationName),
    updateMany: f(OperationTypeNode.MUTATION, gqlNames.updateManyMutationName),
    deleteOne: f(OperationTypeNode.MUTATION, gqlNames.deleteMutationName),
    deleteMany: f(OperationTypeNode.MUTATION, gqlNames.deleteManyMutationName),
  };
  return (context: PickerContext) =>
    Object.fromEntries(
      objectEntriesButUsingKeyof(api).map(([key, impl]) => [
        key,
        (args: Record<string, any>) => impl(args, context),
      ])
    ) as Record<keyof typeof api, any>;
}

export function itemAPIForList(
  listKey: string,
  context: PickerContext
): PickerListsAPI<Record<string, BaseListTypeInfo>>[string] {
  const f = (operation: OperationTypeNode.QUERY | OperationTypeNode.MUTATION, field: string) => {
    const exec = executeGraphQLFieldWithSelection(context.graphql.schema, operation, field);
    return ({ query, ...args }: { query?: string } & Record<string, any> = {}) => {
      const returnFields = query ?? 'id';
      return exec(args, returnFields, context);
    };
  };
  const gqlNames = context.gqlNames(listKey);
  return {
    findOne: f(OperationTypeNode.QUERY, gqlNames.itemQueryName),
    findMany: f(OperationTypeNode.QUERY, gqlNames.listQueryName),
    async count({ where = {} } = {}) {
      const { listQueryCountName, whereInputName } = context.gqlNames(listKey);
      const query = `query ($where: ${whereInputName}!) { count: ${listQueryCountName}(where: $where)  }`;
      const response = await context.graphql.run({ query, variables: { where } });
      return response.count;
    },
    createOne: f(OperationTypeNode.MUTATION, gqlNames.createMutationName),
    createMany: f(OperationTypeNode.MUTATION, gqlNames.createManyMutationName),
    updateOne: f(OperationTypeNode.MUTATION, gqlNames.updateMutationName),
    updateMany: f(OperationTypeNode.MUTATION, gqlNames.updateManyMutationName),
    deleteOne: f(OperationTypeNode.MUTATION, gqlNames.deleteMutationName),
    deleteMany: f(OperationTypeNode.MUTATION, gqlNames.deleteManyMutationName),
  } as PickerListsAPI<Record<string, BaseListTypeInfo>>[string];
}
