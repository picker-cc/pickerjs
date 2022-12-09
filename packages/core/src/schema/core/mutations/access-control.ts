import { mapUniqueWhereToWhere } from '../queries/resolvers';
import { cannotForItem, cannotForItemFields } from '../access-control';
import { InitialisedList } from '../../types-for-lists';
import { BaseItem, PickerContext } from '../../types';
import {
  InputFilter,
  resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
  UniquePrismaFilter
} from '../../fields/filters/where-inputs';
import { accessDeniedError, accessReturnError, extensionError } from '../../error/graphql-errors';
import { runWithPrisma } from '../../utils';

// eslint-disable-next-line max-params
async function getFilteredItem(
  list: InitialisedList,
  context: PickerContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  operation: 'update' | 'delete'
) {
  // early exit if they want to exclude everything
  if (accessFilters === false) {
    throw accessDeniedError(cannotForItem(operation, list));
  }

  // merge the filter access control and try to get the item
  let where = mapUniqueWhereToWhere(uniqueWhere);
  if (typeof accessFilters === 'object') {
    // eslint-disable-next-line require-atomic-updates
    where = { AND: [where, await resolveWhereInput(accessFilters, list, context)] };
  }

  const item = await runWithPrisma(context, list, model => model.findFirst({ where }));
  if (item !== null) return item;

  throw accessDeniedError(cannotForItem(operation, list));
}

// eslint-disable-next-line max-params
export async function checkUniqueItemExists(
  uniqueInput: UniqueInputFilter,
  foreignList: InitialisedList,
  context: PickerContext,
  operation: string
) {
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, foreignList, context);

  // Check whether the item exists (from this users POV).
  try {
    const item = await context.db[foreignList.listKey].findOne({ where: uniqueInput });
    if (item !== null) return uniqueWhere;
  } catch (err) {}

  throw accessDeniedError(cannotForItem(operation, foreignList));
}

async function enforceListLevelAccessControl({
  context,
  operation,
  list,
  item,
  inputData
}: {
  context: PickerContext;
  operation: 'create' | 'update' | 'delete';
  list: InitialisedList;
  item: BaseItem | undefined;
  inputData: Record<string, unknown>;
}) {
  let accepted: unknown; // should be boolean, but dont trust, it might accidentally be a filter
  try {
    // apply access.item.* controls
    if (operation === 'create') {
      const itemAccessControl = list.access.item[operation];
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        inputData
      });
    } else if (operation === 'update' && item !== undefined) {
      const itemAccessControl = list.access.item[operation];
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item,
        inputData
      });
    } else if (operation === 'delete' && item !== undefined) {
      const itemAccessControl = list.access.item[operation];
      accepted = await itemAccessControl({
        operation,
        session: context.session,
        listKey: list.listKey,
        context,
        item
      });
    }
  } catch (error: any) {
    throw extensionError('Access control', [{ error, tag: `${list.listKey}.access.item.${operation}` }]);
  }

  // short circuit the safe path
  if (accepted === true) return;

  if (typeof accepted !== 'boolean') {
    throw accessReturnError([
      {
        tag: `${list.listKey}.access.item.${operation}`,
        returned: typeof accepted
      }
    ]);
  }

  throw accessDeniedError(cannotForItem(operation, list));
}

async function enforceFieldLevelAccessControl({
  context,
  operation,
  list,
  item,
  inputData
}: {
  context: PickerContext;
  operation: 'create' | 'update';
  list: InitialisedList;
  item: BaseItem | undefined;
  inputData: Record<string, unknown>;
}) {
  const nonBooleans: { tag: string; returned: string }[] = [];
  const fieldsDenied: string[] = [];
  const accessErrors: { error: Error; tag: string }[] = [];

  await Promise.allSettled(
    Object.keys(inputData).map(async fieldKey => {
      let accepted: unknown; // should be boolean, but dont trust
      try {
        // apply fields.[fieldKey].access.* controls
        if (operation === 'create') {
          const fieldAccessControl = list.fields[fieldKey].access[operation];
          accepted = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            inputData: inputData as any
          });
        } else if (operation === 'update' && item !== undefined) {
          const fieldAccessControl = list.fields[fieldKey].access[operation];
          accepted = await fieldAccessControl({
            operation,
            session: context.session,
            listKey: list.listKey,
            fieldKey,
            context,
            item,
            inputData
          });
        }
      } catch (error: any) {
        accessErrors.push({ error, tag: `${list.listKey}.${fieldKey}.access.${operation}` });
        return;
      }

      // short circuit the safe path
      if (accepted === true) return;
      fieldsDenied.push(fieldKey);

      // wrong type?
      if (typeof accepted !== 'boolean') {
        nonBooleans.push({
          tag: `${list.listKey}.${fieldKey}.access.${operation}`,
          returned: typeof accepted
        });
      }
    })
  );

  if (nonBooleans.length) {
    throw accessReturnError(nonBooleans);
  }

  if (accessErrors.length) {
    throw extensionError('权限控制', accessErrors);
  }

  if (fieldsDenied.length) {
    throw accessDeniedError(cannotForItemFields(operation, list, fieldsDenied));
  }
}

export async function applyAccessControlForCreate(
  list: InitialisedList,
  context: PickerContext,
  inputData: Record<string, unknown>
) {
  await enforceListLevelAccessControl({
    context,
    operation: 'create',
    list,
    inputData,
    item: undefined
  });

  await enforceFieldLevelAccessControl({
    context,
    operation: 'create',
    list,
    inputData,
    item: undefined
  });
}

// eslint-disable-next-line max-params
export async function getAccessControlledItemForUpdate(
  list: InitialisedList,
  context: PickerContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter,
  inputData: Record<string, any>
) {
  // apply access.filter.* controls
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'update');

  await enforceListLevelAccessControl({
    context,
    operation: 'update',
    list,
    inputData,
    item
  });

  await enforceFieldLevelAccessControl({
    context,
    operation: 'update',
    list,
    inputData,
    item
  });

  return item;
}

// eslint-disable-next-line max-params
export async function getAccessControlledItemForDelete(
  list: InitialisedList,
  context: PickerContext,
  uniqueWhere: UniquePrismaFilter,
  accessFilters: boolean | InputFilter
) {
  // apply access.filter.* controls
  const item = await getFilteredItem(list, context, uniqueWhere!, accessFilters, 'delete');

  await enforceListLevelAccessControl({
    context,
    operation: 'delete',
    list,
    item,
    inputData: {}
  });

  // no field level access control for delete

  return item;
}
