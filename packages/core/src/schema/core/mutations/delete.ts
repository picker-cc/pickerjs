import { cannotForItem, getOperationAccess, getAccessFilters } from '../access-control';
import { InputFilter, resolveUniqueWhereInput, UniqueInputFilter } from '../../fields/filters/where-inputs';
import { InitialisedList } from '../../types-for-lists';
import { PickerContext } from '../../types';
import { checkFilterOrderAccess } from '../../fields/filters/filter-order-access';
import { getWriteLimit, runWithPrisma } from '../../utils';
import { accessDeniedError } from '../../error/graphql-errors';
import { validateDelete } from './validation';
import { runSideEffectOnlyHook } from './hooks';
import { getAccessControlledItemForDelete } from './access-control';

// eslint-disable-next-line max-params
async function deleteSingle(
  uniqueInput: UniqueInputFilter,
  list: InitialisedList,
  context: PickerContext,
  accessFilters: boolean | InputFilter
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list, context);

  // Check filter access
  const fieldKey = Object.keys(uniqueWhere)[0];
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

  // Filter and Item access control. Will throw an accessDeniedError if not allowed.
  const item = await getAccessControlledItemForDelete(list, context, uniqueWhere, accessFilters);

  const hookArgs = {
    operation: 'delete' as const,
    listKey: list.listKey,
    context,
    item,
    resolvedData: undefined as any,
    inputData: undefined as any
  };

  // Apply all validation checks
  await validateDelete({ list, hookArgs });

  // Before operation
  await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs);

  const writeLimit = getWriteLimit(context);

  const newItem = await writeLimit(() =>
    runWithPrisma(context, list, model => model.delete({ where: { id: item.id } }))
  );

  await runSideEffectOnlyHook(list, 'afterOperation', {
    ...hookArgs,
    item: undefined,
    originalItem: item
  });

  return newItem;
}

export async function deleteMany(uniqueInputs: UniqueInputFilter[], list: InitialisedList, context: PickerContext) {
  const operationAccess = await getOperationAccess(list, context, 'delete');

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete');

  return uniqueInputs.map(async uniqueInput => {
    // throw for each item
    if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list));

    return deleteSingle(uniqueInput, list, context, accessFilters);
  });
}

export async function deleteOne(uniqueInput: UniqueInputFilter, list: InitialisedList, context: PickerContext) {
  const operationAccess = await getOperationAccess(list, context, 'delete');
  if (!operationAccess) throw accessDeniedError(cannotForItem('delete', list));

  // Check filter permission to pass into single operation
  const accessFilters = await getAccessFilters(list, context, 'delete');

  return deleteSingle(uniqueInput, list, context, accessFilters);
}
