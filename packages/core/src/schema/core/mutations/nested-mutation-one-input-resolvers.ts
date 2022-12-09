import { InitialisedList } from '../../types-for-lists';
import { userInputError } from '../../error/graphql-errors';
import { GraphQLTypesForList, PickerContext } from '../../types';
import { graphql } from '../../types/schema';
import { NestedMutationState } from './create-update';
import { checkUniqueItemExists } from './access-control';

type _CreateValueType = Exclude<
  graphql.InferValueFromArg<graphql.Arg<Exclude<GraphQLTypesForList['relateTo']['one']['create'], undefined>>>,
  null | undefined
>;
type _UpdateValueType = Exclude<
  graphql.InferValueFromArg<
    graphql.Arg<graphql.NonNullType<Exclude<GraphQLTypesForList['relateTo']['one']['update'], undefined>>>
  >,
  null | undefined
>;

// eslint-disable-next-line consistent-return,max-params
async function handleCreateAndUpdate(
  value: _CreateValueType,
  nestedMutationState: NestedMutationState,
  context: PickerContext,
  foreignList: InitialisedList
) {
  if (value.connect) {
    return { connect: await checkUniqueItemExists(value.connect, foreignList, context, 'connect') };
  } else if (value.create) {
    const { id } = await nestedMutationState.create(value.create, foreignList);
    return { connect: { id } };
  }
}

export function resolveRelateToOneForCreateInput(
  nestedMutationState: NestedMutationState,
  context: PickerContext,
  foreignList: InitialisedList
) {
  return async (value: _CreateValueType) => {
    const numOfKeys = Object.keys(value).length;
    if (numOfKeys !== 1) {
      throw userInputError(
        `You must provide "connect" or "create" in to-one relationship inputs for "create" operations.`
      );
    }
    return handleCreateAndUpdate(value, nestedMutationState, context, foreignList);
  };
}

export function resolveRelateToOneForUpdateInput(
  nestedMutationState: NestedMutationState,
  context: PickerContext,
  foreignList: InitialisedList
) {
  // eslint-disable-next-line consistent-return
  return async (value: _UpdateValueType) => {
    if (Object.keys(value).length !== 1) {
      throw userInputError(
        `You must provide one of "connect", "create" or "disconnect" in to-one relationship inputs for "update" operations.`
      );
    }

    if (value.connect || value.create) {
      return handleCreateAndUpdate(value, nestedMutationState, context, foreignList);
    } else if (value.disconnect) {
      return { disconnect: true };
    }
  };
}
