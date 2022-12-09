import { InitialisedList } from '../../types-for-lists';
import {
  getDBFieldKeyForFieldOnMultiField,
  getPrismaNamespace,
  getWriteLimit,
  IdType,
  promiseAllRejectWithAllErrors,
  runWithPrisma
} from '../../utils';
import { BaseItem, PickerContext } from '../../types';
import { accessDeniedError, extensionError, relationshipError, resolverError } from '../../error/graphql-errors';
import { cannotForItem, getAccessFilters, getOperationAccess } from '../access-control';
import { InputFilter, resolveUniqueWhereInput, UniqueInputFilter } from '../../fields/filters/where-inputs';
import { checkFilterOrderAccess } from '../../fields/filters/filter-order-access';
import { ResolvedDBField } from '../../resolve-relationships';
import { validateUpdateCreate } from './validation';
import { runSideEffectOnlyHook } from './hooks';
import { applyAccessControlForCreate, getAccessControlledItemForUpdate } from './access-control';
import {
  resolveRelateToOneForCreateInput,
  resolveRelateToOneForUpdateInput
} from './nested-mutation-one-input-resolvers';
import {
  RelationshipErrors,
  resolveRelateToManyForCreateInput,
  resolveRelateToManyForUpdateInput
} from './nested-mutation-many-input-resolvers';

async function createSingle(
  { data: rawData }: { data: Record<string, any> },
  list: InitialisedList,
  context: PickerContext
) {
  //  Item access control. Will throw an accessDeniedError if not allowed.
  await applyAccessControlForCreate(list, context, rawData);

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(list, context, rawData, undefined);

  const writeLimit = getWriteLimit(context);

  const item = await writeLimit(() =>
    runWithPrisma(context, list, model => model.create({ data: list.isSingleton ? { ...data, id: 1 } : data }))
  );

  return { item, afterOperation };
}

export class NestedMutationState {
  #afterOperations: (() => void | Promise<void>)[] = [];

  #context: PickerContext;

  constructor(context: PickerContext) {
    this.#context = context;
  }

  async create(data: Record<string, any>, list: InitialisedList) {
    const context = this.#context;

    const operationAccess = await getOperationAccess(list, context, 'create');
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list));

    const { item, afterOperation } = await createSingle({ data }, list, context);

    this.#afterOperations.push(() => afterOperation(item));
    return { id: item.id as IdType };
  }

  async afterOperation() {
    await promiseAllRejectWithAllErrors(this.#afterOperations.map(async x => x()));
  }
}

export async function createOne(
  createInput: { data: Record<string, any> },
  list: InitialisedList,
  context: PickerContext
) {
  const operationAccess = await getOperationAccess(list, context, 'create');
  if (!operationAccess) throw accessDeniedError(cannotForItem('create', list));

  const { item, afterOperation } = await createSingle(createInput, list, context);

  await afterOperation(item);

  return item;
}

export async function createMany(
  createInputs: { data: Record<string, any>[] },
  list: InitialisedList,
  context: PickerContext
) {
  const operationAccess = await getOperationAccess(list, context, 'create');

  return createInputs.data.map(async data => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('create', list));

    const { item, afterOperation } = await createSingle({ data }, list, context);
    await afterOperation(item);
    return item;
  });
}

// eslint-disable-next-line max-params
async function updateSingle(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: PickerContext,
  accessFilters: boolean | InputFilter
) {
  const { where: uniqueInput, data: rawData } = updateInput;
  // Validate and resolve the input filter
  const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list, context);

  // Check filter access
  const fieldKey = Object.keys(uniqueWhere)[0];
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

  // Filter and Item access control. Will throw an accessDeniedError if not allowed.
  const item = await getAccessControlledItemForUpdate(list, context, uniqueWhere, accessFilters, rawData);

  const { afterOperation, data } = await resolveInputForCreateOrUpdate(list, context, rawData, item);

  const writeLimit = getWriteLimit(context);

  const updatedItem = await writeLimit(() =>
    runWithPrisma(context, list, model => model.update({ where: { id: item.id }, data }))
  );

  await afterOperation(updatedItem);

  return updatedItem;
}

export async function updateOne(
  updateInput: { where: UniqueInputFilter; data: Record<string, any> },
  list: InitialisedList,
  context: PickerContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update');
  if (!operationAccess) throw accessDeniedError(cannotForItem('update', list));

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return updateSingle(updateInput, list, context, accessFilters);
}

export async function updateMany(
  { data }: { data: { where: UniqueInputFilter; data: Record<string, any> }[] },
  list: InitialisedList,
  context: PickerContext
) {
  const operationAccess = await getOperationAccess(list, context, 'update');

  // Get list-level access control filters
  const accessFilters = await getAccessFilters(list, context, 'update');

  return data.map(async updateInput => {
    // throw for each attempt
    if (!operationAccess) throw accessDeniedError(cannotForItem('update', list));

    return updateSingle(updateInput, list, context, accessFilters);
  });
}

async function getResolvedData(
  list: InitialisedList,
  hookArgs: {
    context: PickerContext;
    listKey: string;
    inputData: Record<string, any>;
  } & ({ operation: 'create'; item: undefined } | { operation: 'update'; item: BaseItem }),
  nestedMutationState: NestedMutationState
) {
  const { context, operation } = hookArgs;

  // Start with the original input
  let resolvedData = hookArgs.inputData;

  // Apply non-relationship field type input resolvers
  const resolverErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind !== 'relation') {
          try {
            input = await inputResolver(input, context, undefined);
          } catch (error: any) {
            resolverErrors.push({ error, tag: `${list.listKey}.${fieldKey}` });
          }
        }
        return [fieldKey, input] as const;
      })
    )
  );
  if (resolverErrors.length) {
    throw resolverError(resolverErrors);
  }

  // Apply relationship field type input resolvers
  const relationshipErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        const inputResolver = field.input?.[operation]?.resolve;
        let input = resolvedData[fieldKey];
        if (inputResolver && field.dbField.kind === 'relation') {
          const tag = `${list.listKey}.${fieldKey}`;
          try {
            // eslint-disable-next-line require-atomic-updates
            input = await inputResolver(
              input,
              context,
              // This third argument only applies to relationship fields
              (() => {
                if (input === undefined) {
                  // No-op: This is what we want
                  return () => input!;
                }
                if (input === null) {
                  // No-op: Should this be UserInputError?
                  return () => input!;
                }
                const foreignList = list.lists[field.dbField.list];
                let resolver;
                if (field.dbField.mode === 'many') {
                  if (operation === 'create') {
                    resolver = resolveRelateToManyForCreateInput;
                  } else {
                    resolver = resolveRelateToManyForUpdateInput;
                  }
                } else if (operation === 'create') {
                  resolver = resolveRelateToOneForCreateInput;
                } else {
                  resolver = resolveRelateToOneForUpdateInput;
                }
                return resolver(nestedMutationState, context, foreignList, tag);
              })()
            );
          } catch (error: any) {
            if (error instanceof RelationshipErrors) {
              relationshipErrors.push(...error.errors);
            } else {
              relationshipErrors.push({ error, tag });
            }
          }
        }
        return [fieldKey, input] as const;
      })
    )
  );
  if (relationshipErrors.length) {
    throw relationshipError(relationshipErrors);
  }

  // Resolve input hooks
  const hookName = 'resolveInput';
  // Field hooks
  const fieldsErrors: { error: Error; tag: string }[] = [];
  resolvedData = Object.fromEntries(
    await Promise.all(
      Object.entries(list.fields).map(async ([fieldKey, field]) => {
        if (field.hooks.resolveInput === undefined) {
          return [fieldKey, resolvedData[fieldKey]];
        }
        try {
          return [
            fieldKey,
            await field.hooks.resolveInput({
              ...hookArgs,
              resolvedData,
              fieldKey
            })
          ];
        } catch (error: any) {
          fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` });
          return [fieldKey, undefined];
        }
      })
    )
  );
  if (fieldsErrors.length) {
    throw extensionError(hookName, fieldsErrors);
  }

  // List hooks
  if (list.hooks.resolveInput) {
    try {
      // eslint-disable-next-line require-atomic-updates
      resolvedData = (await list.hooks.resolveInput({ ...hookArgs, resolvedData })) as any;
    } catch (error: any) {
      throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }]);
    }
  }

  return resolvedData;
}

// eslint-disable-next-line max-params
async function resolveInputForCreateOrUpdate(
  list: InitialisedList,
  context: PickerContext,
  inputData: Record<string, any>,
  item: BaseItem | undefined
) {
  const nestedMutationState = new NestedMutationState(context);
  const baseHookArgs = {
    context,
    listKey: list.listKey,
    inputData,
    resolvedData: {}
  };
  const hookArgs =
    item === undefined
      ? { ...baseHookArgs, operation: 'create' as const, item }
      : { ...baseHookArgs, operation: 'update' as const, item };

  // Take the original input and resolve all the fields down to what
  // will be saved into the database.
  // eslint-disable-next-line require-atomic-updates,@typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line require-atomic-updates
  hookArgs.resolvedData = await getResolvedData(list, hookArgs, nestedMutationState);

  // Apply all validation checks
  await validateUpdateCreate({ list, hookArgs });

  // Run beforeOperation hooks
  await runSideEffectOnlyHook(list, 'beforeOperation', hookArgs);

  // Return the full resolved input (ready for prisma level operation),
  // and the afterOperation hook to be applied
  return {
    data: transformForPrismaClient(list.fields, hookArgs.resolvedData, context),
    afterOperation: async (updatedItem: BaseItem) => {
      await nestedMutationState.afterOperation();
      await runSideEffectOnlyHook(
        list,
        'afterOperation',
        // at runtime this conditional is pointless
        // but TypeScript needs it because in each case, it will narrow
        // `hookArgs` based on the `operation` which will make `hookArgs.item`
        // be the right type for `originalItem` for the operation
        // {...hookArgs, item: updatedItem, originalItem: hookArgs.item}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        hookArgs.operation === 'create'
          ? { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
          : { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
      );
    }
  };
}

function transformInnerDBField(
  dbField: Exclude<ResolvedDBField, { kind: 'multi' }>,
  context: PickerContext,
  value: unknown
) {
  if (dbField.kind === 'scalar' && dbField.scalar === 'Json' && value === null) {
    const Prisma = getPrismaNamespace(context);
    return Prisma.DbNull;
  }
  return value;
}

function transformForPrismaClient(
  fields: Record<string, { dbField: ResolvedDBField }>,
  data: Record<string, any>,
  context: PickerContext
) {
  return Object.fromEntries(
    Object.entries(data).flatMap(([fieldKey, value]) => {
      const { dbField } = fields[fieldKey];
      if (dbField.kind === 'multi') {
        return Object.entries(value).map(([innerFieldKey, fieldValue]) => {
          return [
            getDBFieldKeyForFieldOnMultiField(fieldKey, innerFieldKey),
            transformInnerDBField(dbField.fields[innerFieldKey], context, fieldValue)
          ];
        });
      }

      return [[fieldKey, transformInnerDBField(dbField, context, value)]];
    })
  );
}
