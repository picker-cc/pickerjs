import {getDBFieldKeyForFieldOnMultiField, InitialisedList} from "../../prisma/prisma-schema";
import {BaseItem, PickerContext} from "../../types";
import {accessDeniedError, extensionError, relationshipError, resolverError} from "../../error/graphql-errors";
import {runWithPrisma} from "../queries/resolvers";
import pLimit, {Limit} from "p-limit";
import {PrismaModule} from "../../artifacts";
import {getAccessFilters, getOperationAccess} from "../access-control";
import {IdType} from "../queries/output-field";
import {InputFilter, resolveUniqueWhereInput, UniqueInputFilter} from "../../types/filters/where-inputs";
import {checkFilterOrderAccess} from "../../types/filters/filter-order-access";
import {runSideEffectOnlyHook} from "./hooks";
import {ResolvedDBField} from "../../resolve-relationships";
import {
    RelationshipErrors,
    resolveRelateToManyForCreateInput,
    resolveRelateToManyForUpdateInput
} from "./nested-mutation-many-input-resolvers";
import {
    resolveRelateToOneForCreateInput,
    resolveRelateToOneForUpdateInput
} from "./nested-mutation-one-input-resolvers";
import {applyAccessControlForCreate, getAccessControlledItemForUpdate} from "./access-control";
import {validateUpdateCreate} from "./validation";

// these aren't here out of thinking this is better syntax(i do not think it is),
// it's just because TS won't infer the arg is X bit
export const isFulfilled = <T>(arg: PromiseSettledResult<T>): arg is PromiseFulfilledResult<T> =>
    arg.status === 'fulfilled';
export const isRejected = (arg: PromiseSettledResult<any>): arg is PromiseRejectedResult =>
    arg.status === 'rejected';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export async function promiseAllRejectWithAllErrors<T extends unknown[]>(
    promises: readonly [...T]
): Promise<{ [P in keyof T]: Awaited<T[P]> }> {
    const results = await Promise.allSettled(promises);
    if (!results.every(isFulfilled)) {
        const errors = results.filter(isRejected).map(x => x.reason);
        // AggregateError would be ideal here but it's not in Node 12 or 14
        // (also all of our error stuff is just meh. this whole thing is just to align with previous behaviour)
        const error = new Error(errors[0].message || errors[0].toString());
        (error as any).errors = errors;
        throw error;
    }

    return results.map((x: any) => x.value) as any;
}


// this whole thing exists because Prisma doesn't handle doing multiple writes on SQLite well
// https://github.com/prisma/prisma/issues/2955
// note this is keyed by the prisma client instance, not the context
// because even across requests, we want to apply the limit on SQLite
const writeLimits = new WeakMap<object, Limit>();

export function setWriteLimit(prismaClient: object, limit: Limit) {
    console.log('set write limit')
    writeLimits.set(prismaClient, limit);
}

// this accepts the context instead of the prisma client because the prisma client on context is `any`
// so by accepting the context, it'll be less likely the wrong thing will be passed.
export function getWriteLimit(context: PickerContext) {
    const limit = writeLimits.get(context.prisma);
    if (limit === undefined) {
        throw new Error('unexpected write limit not set for prisma client');
    }
    return limit;
}

const prismaNamespaces = new WeakMap<object, PrismaModule['Prisma']>();

export function setPrismaNamespace(prismaClient: object, prismaNamespace: PrismaModule['Prisma']) {
    prismaNamespaces.set(prismaClient, prismaNamespace);
}

// this accepts the context instead of the prisma client because the prisma client on context is `any`
// so by accepting the context, it'll be less likely the wrong thing will be passed.
export function getPrismaNamespace(context: PickerContext) {
    const limit = prismaNamespaces.get(context.prisma);
    if (limit === undefined) {
        throw new Error('unexpected prisma namespace not set for prisma client');
    }
    return limit;
}

async function createSingle(
    { data: rawData }: { data: Record<string, any> },
    list: InitialisedList,
    context: PickerContext,
    operationAccess: boolean
) {
    // Operation level access control
    if (!operationAccess) {
        throw accessDeniedError(
            `You cannot perform the 'create' operation on the list '${list.listKey}'.`
        );
    }

    //  Item access control. Will throw an accessDeniedError if not allowed.
    await applyAccessControlForCreate(list, context, rawData);

    const { afterOperation, data } = await resolveInputForCreateOrUpdate(
        list,
        context,
        rawData,
        undefined
    );

    // const prismaClient = new PrismaClient()
    // context.prisma = prismaClient
    // setWriteLimit(context.prisma, pLimit(1));
    //
    const writeLimit = getWriteLimit(context);

    const item = await writeLimit(() =>
        runWithPrisma(context, list, model => {
            return model.create({ data })})
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

        // Check operation permission to pass into single operation
        const operationAccess = await getOperationAccess(list, context, 'create');

        const { item, afterOperation } = await createSingle({ data }, list, context, operationAccess);

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
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'create');

    const { item, afterOperation } = await createSingle(createInput, list, context, operationAccess);

    await afterOperation(item);

    return item;
}

export async function createMany(
    createInputs: { data: Record<string, any>[] },
    list: InitialisedList,
    context: PickerContext
) {
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'create');

    return createInputs.data.map(async data => {
        const { item, afterOperation } = await createSingle({ data }, list, context, operationAccess);

        await afterOperation(item);

        return item;
    });
}

async function updateSingle(
    updateInput: { where: UniqueInputFilter; data: Record<string, any> },
    list: InitialisedList,
    context: PickerContext,
    accessFilters: boolean | InputFilter,
    operationAccess: boolean
) {
    // Operation level access control
    if (!operationAccess) {
        throw accessDeniedError(
            `You cannot perform the 'update' operation on the list '${list.listKey}'.`
        );
    }

    const { where: uniqueInput, data: rawData } = updateInput;
    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list.fields, context);

    // Check filter access
    const fieldKey = Object.keys(uniqueWhere)[0];
    await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

    // Filter and Item access control. Will throw an accessDeniedError if not allowed.
    const item = await getAccessControlledItemForUpdate(
        list,
        context,
        uniqueWhere,
        accessFilters,
        rawData
    );

    const { afterOperation, data } = await resolveInputForCreateOrUpdate(
        list,
        context,
        rawData,
        item
    );

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
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'update');

    // Get list-level access control filters
    const accessFilters = await getAccessFilters(list, context, 'update');

    return updateSingle(updateInput, list, context, accessFilters, operationAccess);
}

export async function updateMany(
    { data }: { data: { where: UniqueInputFilter; data: Record<string, any> }[] },
    list: InitialisedList,
    context: PickerContext
) {
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'update');

    // Get list-level access control filters
    const accessFilters = await getAccessFilters(list, context, 'update');

    return data.map(async updateInput =>
        updateSingle(updateInput, list, context, accessFilters, operationAccess)
    );
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
                        input = await inputResolver(
                            input,
                            context,
                            // This third argument only applies to relationship fields
                            (() => {
                                if (input === undefined) {
                                    // No-op: This is what we want
                                    // return () => undefined;
                                    // 如果不设置为 undefined Prisma 保存时这个外链是错误的
                                    return () => input!
                                }
                                if (input === null) {
                                    // No-op: Should this be UserInputError?
                                    return () => input!
                                    // return () => undefined;
                                }
                                const foreignList = list.lists[field.dbField.list];
                                let resolver;
                                if (field.dbField.mode === 'many') {
                                    if (operation === 'create') {
                                        resolver = resolveRelateToManyForCreateInput;
                                    } else {
                                        resolver = resolveRelateToManyForUpdateInput;
                                    }
                                } else {
                                    if (operation === 'create') {
                                        resolver = resolveRelateToOneForCreateInput;
                                    } else {
                                        resolver = resolveRelateToOneForUpdateInput;
                                    }
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
                } else {
                    try {
                        return [
                            fieldKey,
                            await field.hooks.resolveInput({
                                ...hookArgs,
                                resolvedData,
                                fieldKey,
                            }),
                        ];
                    } catch (error: any) {
                        fieldsErrors.push({ error, tag: `${list.listKey}.${fieldKey}.hooks.${hookName}` });
                        return [fieldKey, undefined];
                    }
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
            resolvedData = (await list.hooks.resolveInput({ ...hookArgs, resolvedData })) as any;
        } catch (error: any) {
            throw extensionError(hookName, [{ error, tag: `${list.listKey}.hooks.${hookName}` }]);
        }
    }

    return resolvedData;
}

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
        resolvedData: {},
    };
    const hookArgs: any =
        item === undefined
            ? { ...baseHookArgs, operation: 'create' as const, item }
            : { ...baseHookArgs, operation: 'update' as const, item };

    // Take the original input and resolve all the fields down to what
    // will be saved into the database.
    hookArgs.resolvedData = await getResolvedData(list, hookArgs as any, nestedMutationState);

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
                hookArgs.operation === 'create'
                    ? { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
                    : { ...hookArgs, item: updatedItem, originalItem: hookArgs.item }
            );
        },
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
                        transformInnerDBField(dbField.fields[innerFieldKey], context, fieldValue),
                    ];
                });
            }

            return [[fieldKey, transformInnerDBField(dbField, context, value)]];
        })
    );
}
