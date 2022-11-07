import { GraphQLNamedType, GraphQLSchema } from "graphql";

import { getMutationsForList } from "./mutations";
import { getQueriesForList } from "./queries";
import { graphql } from "../types/schema";
import { InitialisedList } from "../prisma/prisma-schema";
import { initialiseLists } from "../types-for-lists";
import { createGraphQLSchema } from "../createGraphQLSchema";
import { stitchSchemas, ValidationLevel } from '@graphql-tools/stitch';
import {SchemaConfig, FieldData} from "../types";

export function getMyGraphQLSchema(
    schema: GraphQLSchema,
    lists: Record<string, InitialisedList>,
) {
    const query = graphql.object()({
        name: "Query",
        fields: Object.assign(
            {},
            ...Object.values(lists).map(list => {
                return getQueriesForList(list);
            }),
        )
    });

    const updateManyByList: Record<string, graphql.InputObjectType<any>> = {};

    const mutation = graphql.object()({
        name: "Mutation",
        fields: Object.assign(
            {},
            ...Object.values(lists).map(list => {
                const { mutations, updateManyInput } = getMutationsForList(list);
                updateManyByList[list.listKey] = updateManyInput;
                return mutations;
            }),
        )
    });
    // const graphQLSchema = new GraphQLSchema({
    //     query: query.graphQLType,
    //     mutation: mutation.graphQLType,
        // not about behaviour, only ordering
        // types: [...collectTypes(lists, updateManyByList), mutation.graphQLType]
    // });

    // return graphQLSchema;
    return stitchSchemas({
        subschemas: [schema],
        types: [...collectTypes(lists, updateManyByList), mutation.graphQLType, query.graphQLType],
        typeMergingOptions: { validationSettings: { validationLevel: ValidationLevel.Off } },
    })
}

export function getGraphQLSchema(
  lists: Record<string, InitialisedList>,
  extraFields: {
    mutation: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
    query: Record<string, graphql.Field<unknown, any, graphql.OutputType, string>>;
  }
) {
  const query = graphql.object()({
    name: "Query",
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        return getQueriesForList(list);
      }),
      extraFields.query
    )
  });


  const updateManyByList: Record<string, graphql.InputObjectType<any>> = {};

  const mutation = graphql.object()({
    name: "Mutation",
    fields: Object.assign(
      {},
      ...Object.values(lists).map(list => {
        const { mutations, updateManyInput } = getMutationsForList(list);
        updateManyByList[list.listKey] = updateManyInput;
        return mutations;
      }),
      extraFields.mutation
    )
  });
  const graphQLSchema = new GraphQLSchema({
    query: query.graphQLType,
    mutation: mutation.graphQLType,
    // not about behaviour, only ordering
    types: [...collectTypes(lists, updateManyByList), mutation.graphQLType]
  });
  return graphQLSchema;
}

function collectTypes(
  lists: Record<string, InitialisedList>,
  updateManyByList: Record<string, graphql.InputObjectType<any>>
) {
  const collectedTypes: GraphQLNamedType[] = [];
  for (const list of Object.values(lists)) {
    const { isEnabled } = list.graphql;
    if (!isEnabled.type) continue;
    // adding all of these types explicitly isn't strictly necessary but we do it to create a certain order in the schema
    collectedTypes.push(list.types.output.graphQLType);
    if (isEnabled.query || isEnabled.update || isEnabled.delete) {
      collectedTypes.push(list.types.uniqueWhere.graphQLType);
    }
    if (isEnabled.query) {
      for (const field of Object.values(list.fields)) {
        if (
          isEnabled.query &&
          field.graphql.isEnabled.read &&
          field.unreferencedConcreteInterfaceImplementations
        ) {
          // this _IS_ actually necessary since they aren't implicitly referenced by other types, unlike the types above
          collectedTypes.push(
            ...field.unreferencedConcreteInterfaceImplementations.map(x => x.graphQLType)
          );
        }
      }
      collectedTypes.push(list.types.where.graphQLType);
      collectedTypes.push(list.types.orderBy.graphQLType);
    }
    if (isEnabled.update) {
      collectedTypes.push(list.types.update.graphQLType);
      collectedTypes.push(updateManyByList[list.listKey].graphQLType);
    }
    if (isEnabled.create) {
      collectedTypes.push(list.types.create.graphQLType);
    }
  }
  // this is not necessary, just about ordering
  collectedTypes.push(graphql.JSON.graphQLType);
  return collectedTypes;
}

export function getSudoGraphQLSchema(config: SchemaConfig) {
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
    models: Object.fromEntries(
      Object.entries(config.models).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: { operation: {}, item: {}, filter: {} },
            graphql: { ...(list.graphql || {}), omit: [] },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
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
  // const adminMeta = createAdminMeta(transformedConfig, lists);
  return createGraphQLSchema(transformedConfig, lists);
}
