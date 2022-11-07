import {assertInputObjectType} from 'graphql';
import {getGqlNames, InitialisedList} from "../prisma/prisma-schema";
import {accessReturnError, extensionError} from "../error/graphql-errors";
import {InputFilter} from "../types/filters/where-inputs";
import {PickerContext, MaybePromise, BaseListTypeInfo, PickerContextFromListTypeInfo} from "../types";
import {coerceAndValidateForGraphQLInput} from "../coerceAndValidateForGraphQLInput";

type BaseAccessArgs<ListTypeInfo extends BaseListTypeInfo> = {
    session: any;
    listKey: string;
    context: PickerContextFromListTypeInfo<ListTypeInfo>;
};

// List Filter Access

type FilterOutput<ListTypeInfo extends BaseListTypeInfo> =
    | boolean
    | ListTypeInfo['inputs']['where'];

export type ListFilterAccessControl<Operation extends 'query' | 'update' | 'delete',
    ListTypeInfo extends BaseListTypeInfo> = (
    args: BaseAccessArgs<ListTypeInfo> & { operation: Operation }
) => MaybePromise<FilterOutput<ListTypeInfo>>;

// List Item Access

type CreateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
    operation: 'create';
    /**
     * The input passed in from the GraphQL API
     */
    inputData: ListTypeInfo['inputs']['create'];
};

export type CreateListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
    args: CreateItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

type UpdateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
    operation: 'update';
    /**
     * The item being updated
     */
    item: ListTypeInfo['item'];
    /**
     * The input passed in from the GraphQL API
     */
    inputData: ListTypeInfo['inputs']['update'];
};

export type UpdateListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
    args: UpdateItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

type DeleteItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> = BaseAccessArgs<ListTypeInfo> & {
    operation: 'delete';
    /**
     * The item being deleted
     */
    item: ListTypeInfo['item'];
};

export type DeleteListItemAccessControl<ListTypeInfo extends BaseListTypeInfo> = (
    args: DeleteItemAccessArgs<ListTypeInfo>
) => MaybePromise<boolean>;

export type ListOperationAccessControl<Operation extends 'create' | 'query' | 'update' | 'delete',
    ListTypeInfo extends BaseListTypeInfo> = (args: BaseAccessArgs<ListTypeInfo> & { operation: Operation }) => MaybePromise<boolean>;


// 列表级访问控制，允许为每个列表自动生成的 CRUD API 设置权限。
//
// * `operation` 权限让你检查 `context` 和 `session` 对象中的信息，以决定是否允许访问列表
// * `filter` 权限让你提供一个 GraphQL 过滤器，它定义了用户允许被访问的项目。
// * `item` access lets you write a function which inspects the provided input data and the existing object (if it exists)
// * `item` 权限让你写一个 function 来检查提供的输入数据和现有的对象（如果它存在），并根据这些额外的数据做出决策。
//
// 如果由于任何访问控制方法而拒绝访问，那么 GraphQL API 将返回以下响应：
//   Mutations:
//     - 单个操作将返回 `null` 并返回一个拒绝访问（access denied error）的错误。
//     - 多个操作将返回一个 `null` 值的数据数组，用于拒绝访问的项，并返回每个 `null` 项的拒绝访问错误。
//   Queries:
//     - 单项查询将返回 `null` 无错误信息
//     - 多项查询将过滤那些访问被拒绝的条目，无错误信息
//     - Count 查询将只计算那些访问没有被拒绝的项目，无错误信息
//
export type ListAccessControl<ListTypeInfo extends BaseListTypeInfo> = {
    // These functions should return `true` if access is allowed or `false` if access is denied.
    operation?: {
        query?: ListOperationAccessControl<'query', ListTypeInfo>;
        create?: ListOperationAccessControl<'create', ListTypeInfo>;
        update?: ListOperationAccessControl<'update', ListTypeInfo>;
        delete?: ListOperationAccessControl<'delete', ListTypeInfo>;
    };

    // 这个 'filter' 规则可以返回：
    // - 一个过滤器。在这种情况下，操作可以继续进行，但是在 updating/reading/deleting 时将额外应用过滤器，这可能会使某些项看起来不存在。
    // - 布尔值 true/false。 如果为 false，则视为永远不匹配的过滤器。
    filter?: {
        query?: ListFilterAccessControl<'query', ListTypeInfo>;
        update?: ListFilterAccessControl<'update', ListTypeInfo>;
        delete?: ListFilterAccessControl<'delete', ListTypeInfo>;
        // create: not supported: FIXME: Add explicit check that people don't try this.
        // FIXME: Write tests for parseAccessControl.
    };

    // These rules are applied to each item being operated on individually. They return `true` or `false`,
    // and if false, an access denied error will be returned for the individual operation.
    // 这些规则应用于被单独操作的每个项目。它们返回 `true` 或 `false`,
    // 如果为 false，将为单个操作返回一个拒绝访问的错误。
    item?: {
        // query: not supported
        create?: CreateListItemAccessControl<ListTypeInfo>;
        update?: UpdateListItemAccessControl<ListTypeInfo>;
        delete?: DeleteListItemAccessControl<ListTypeInfo>;
    };
};

// Field Access
export type IndividualFieldAccessControl<Args> = (args: Args) => MaybePromise<boolean>;

export type FieldCreateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
    CreateItemAccessArgs<ListTypeInfo> & { fieldKey: string };

export type FieldReadItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
    BaseAccessArgs<ListTypeInfo> & {
    operation: 'read';
    fieldKey: string;
    item: ListTypeInfo['item'];
};

export type FieldUpdateItemAccessArgs<ListTypeInfo extends BaseListTypeInfo> =
    UpdateItemAccessArgs<ListTypeInfo> & { fieldKey: string };

export type FieldAccessControl<ListTypeInfo extends BaseListTypeInfo> =
    | {
    read?: IndividualFieldAccessControl<FieldReadItemAccessArgs<ListTypeInfo>>;
    create?: IndividualFieldAccessControl<FieldCreateItemAccessArgs<ListTypeInfo>>;
    update?: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<ListTypeInfo>>;
    // filter?: COMING SOON
    // orderBy?: COMING SOON
}
    | IndividualFieldAccessControl<| FieldCreateItemAccessArgs<ListTypeInfo>
    | FieldReadItemAccessArgs<ListTypeInfo>
    | FieldUpdateItemAccessArgs<ListTypeInfo>>;


export async function getOperationAccess(
    list: InitialisedList,
    context: PickerContext,
    operation: 'delete' | 'create' | 'update' | 'query'
) {
    const args = {operation, session: context.session, listKey: list.listKey, context};
    // Check the mutation access
    const access = list.access.operation[operation];
    let result;
    try {
        // @ts-ignore
        result = await access(args);
    } catch (error: any) {
        throw extensionError('Access control', [
            {error, tag: `${list.listKey}.access.operation.${args.operation}`},
        ]);
    }

    const resultType = typeof result;

    // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
    // has accidentally tried to return a filters.
    if (resultType !== 'boolean') {
        throw accessReturnError([
            {tag: `${args.listKey}.access.operation.${args.operation}`, returned: resultType},
        ]);
    }

    return result;
}

export async function getAccessFilters(
    list: InitialisedList,
    context: PickerContext,
    operation: 'update' | 'query' | 'delete'
): Promise<boolean | InputFilter> {
    const args = {operation, session: context.session, listKey: list.listKey, context};
    // Check the mutation access
    const access = list.access.filter[operation];
    try {
        // @ts-ignore
        let filters = typeof access === 'function' ? await access(args) : access;
        if (typeof filters === 'boolean') {
            return filters;
        }
        const schema = context.sudo().graphql.schema;
        const whereInput = assertInputObjectType(schema.getType(getGqlNames(list).whereInputName));
        const result = coerceAndValidateForGraphQLInput(schema, whereInput, filters);
        if (result.kind === 'valid') {
            return result.value;
        }
        throw result.error;
    } catch (error: any) {
        throw extensionError('Access control', [
            {error, tag: `${args.listKey}.access.filter.${args.operation}`},
        ]);
    }
}

export function parseFieldAccessControl(
    access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
    if (typeof access === 'boolean' || typeof access === 'function') {
        return {read: access, create: access, update: access};
    }
    // note i'm intentionally not using spread here because typescript can't express an optional property which cannot be undefined so spreading would mean there is a possibility that someone could pass {access: undefined} or {access:{read: undefined}} and bad things would happen
    return {
        read: access?.read ?? (() => true),
        create: access?.create ?? (() => true),
        update: access?.update ?? (() => true),
        // delete: not supported
    };
}

export type ResolvedFieldAccessControl = {
    read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>;
    create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseListTypeInfo>>;
    update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseListTypeInfo>>;
};

export function parseListAccessControl(
    access: ListAccessControl<BaseListTypeInfo> | undefined
): ResolvedListAccessControl {
    let item, filter, operation;

    // console.log(access.operation)
    if (typeof access?.operation === 'function') {
        operation = {
            create: access.operation,
            query: access.operation,
            update: access.operation,
            delete: access.operation,
        };
    } else {
        // Note I'm intentionally not using spread here because typescript can't express
        // an optional property which cannot be undefined so spreading would mean there
        // is a possibility that someone could pass { access: undefined } or
        // { access: { read: undefined } } and bad things would happen.
        operation = {
            create: access?.operation?.create ?? (() => true),
            query: access?.operation?.query ?? (() => true),
            update: access?.operation?.update ?? (() => true),
            delete: access?.operation?.delete ?? (() => true),
        };
    }

    if (typeof access?.filter === 'boolean' || typeof access?.filter === 'function') {
        filter = {query: access.filter, update: access.filter, delete: access.filter};
    } else {
        filter = {
            // create: not supported
            query: access?.filter?.query ?? (() => true),
            update: access?.filter?.update ?? (() => true),
            delete: access?.filter?.delete ?? (() => true),
        };
    }

    if (typeof access?.item === 'boolean' || typeof access?.item === 'function') {
        item = {create: access.item, update: access.item, delete: access.item};
    } else {
        item = {
            create: access?.item?.create ?? (() => true),
            // read: not supported
            update: access?.item?.update ?? (() => true),
            delete: access?.item?.delete ?? (() => true),
        };
    }
    return {operation, filter, item};
}

export type ResolvedListAccessControl = {
    operation: {
        create: ListOperationAccessControl<'create', BaseListTypeInfo>;
        query: ListOperationAccessControl<'query', BaseListTypeInfo>;
        update: ListOperationAccessControl<'update', BaseListTypeInfo>;
        delete: ListOperationAccessControl<'delete', BaseListTypeInfo>;
    };
    filter: {
        // create: not supported
        query: ListFilterAccessControl<'query', BaseListTypeInfo>;
        update: ListFilterAccessControl<'update', BaseListTypeInfo>;
        delete: ListFilterAccessControl<'delete', BaseListTypeInfo>;
    };
    item: {
        create: CreateListItemAccessControl<BaseListTypeInfo>;
        // query: not supported
        update: UpdateListItemAccessControl<BaseListTypeInfo>;
        delete: DeleteListItemAccessControl<BaseListTypeInfo>;
    };
};
