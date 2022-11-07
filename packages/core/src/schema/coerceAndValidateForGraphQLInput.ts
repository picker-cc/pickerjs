import {GraphQLError, GraphQLInputType, GraphQLSchema, Kind, VariableDefinitionNode} from 'graphql';
import {getVariableValues} from 'graphql/execution/values';
import {getTypeNodeForType} from "./context/executeGraphQLFieldToRootVal";

const argName = 'where';

// 对GraphQL输入进行强制和验证
export function coerceAndValidateForGraphQLInput(
  schema: GraphQLSchema,
  type: GraphQLInputType,
  value: any
): { kind: 'valid'; value: any } | { kind: 'error'; error: GraphQLError } {
  const variableDefintions: VariableDefinitionNode[] = [
    {
      kind: Kind.VARIABLE_DEFINITION,
      type: getTypeNodeForType(type),
      variable: { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: argName } },
    },
  ];

  const coercedVariableValues = getVariableValues(schema, variableDefintions, {
    [argName]: value,
  });
  if (coercedVariableValues.errors) {
    return { kind: 'error', error: coercedVariableValues.errors[0] };
  }
  return { kind: 'valid', value: coercedVariableValues.coerced[argName] };
}
