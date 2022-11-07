import { getAccessControlledItemForDelete } from './access-control';
import { runSideEffectOnlyHook } from './hooks';
import { validateDelete } from './validation';
import {InputFilter, resolveUniqueWhereInput, UniqueInputFilter} from "../../types/filters/where-inputs";
import {InitialisedList} from "../../prisma/prisma-schema";
import {accessDeniedError} from "../../error/graphql-errors";
import {PickerContext} from "../../types";
import {checkFilterOrderAccess} from "../../types/filters/filter-order-access";
import {getWriteLimit} from "./create-update";
import {runWithPrisma} from "../queries/resolvers";
import {getAccessFilters, getOperationAccess} from "../access-control";

async function deleteSingle(
    uniqueInput: UniqueInputFilter,
    list: InitialisedList,
    context: PickerContext,
    accessFilters: boolean | InputFilter,
    operationAccess: boolean
) {
    // Operation level access control
    if (!operationAccess) {
        throw accessDeniedError(
            `You cannot perform the 'delete' operation on the list '${list.listKey}'.`
        );
    }

    // Validate and resolve the input filter
    const uniqueWhere = await resolveUniqueWhereInput(uniqueInput, list.fields, context);
    // Check filter access
    const fieldKey = Object.keys(uniqueWhere)[0];
    await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

    // Filter and Item access control. Will throw an accessDeniedError if not allowed.
    const item = await getAccessControlledItemForDelete(list, context, uniqueWhere, accessFilters);

    const hookArgs: any = {
        operation: 'delete' as const,
        listKey: list.listKey,
        context,
        item,
        resolvedData: undefined,
        inputData: undefined,
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
        originalItem: item,
    });

    return newItem;
}

export async function deleteMany(
    uniqueInputs: UniqueInputFilter[],
    list: InitialisedList,
    context: PickerContext
) {
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'delete');

    // Check filter permission to pass into single operation
    const accessFilters = await getAccessFilters(list, context, 'delete');

    return uniqueInputs.map(async uniqueInput =>
        deleteSingle(uniqueInput, list, context, accessFilters, operationAccess)
    );
}

export async function deleteOne(
    uniqueInput: UniqueInputFilter,
    list: InitialisedList,
    context: PickerContext
) {
    // Check operation permission to pass into single operation
    const operationAccess = await getOperationAccess(list, context, 'delete');

    // Check filter permission to pass into single operation
    const accessFilters = await getAccessFilters(list, context, 'delete');

    return deleteSingle(uniqueInput, list, context, accessFilters, operationAccess);
}
