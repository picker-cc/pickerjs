import { assertInputObjectType } from 'graphql';
import { accessReturnError, extensionError } from '../error/graphql-errors';
import { InputFilter } from '../fields/filters/where-inputs';
import {
  PickerContext,
  BaseListTypeInfo,
  getGqlNames,
  IndividualFieldAccessControl,
  FieldCreateItemAccessArgs,
  FieldUpdateItemAccessArgs,
  FieldReadItemAccessArgs,
  FieldAccessControl,
  MaybePromise
} from '../types';
import { coerceAndValidateForGraphQLInput } from '../coerceAndValidateForGraphQLInput';
import {
  AccessOperation,
  BaseAccessArgs,
  CreateListItemAccessControl,
  DeleteListItemAccessControl,
  ListFilterAccessControl,
  ListOperationAccessControl,
  UpdateListItemAccessControl
} from '../types/config/access-control';
import { InitialisedList } from '../types-for-lists';

export function cannotForItem(operation: string, list: InitialisedList) {
  return `你不能 ${operation} 这个 ${list.listKey}${operation === 'create' ? '' : ' - 它可能不存在'}`;
}

export function cannotForItemFields(operation: string, list: InitialisedList, fieldsDenied: string[]) {
  return `你不能 ${operation} 这个 ${list.listKey} - 你不能 ${operation} 这些字段 ${JSON.stringify(fieldsDenied)}`;
}

export async function getOperationAccess(
  list: InitialisedList,
  context: PickerContext,
  operation: 'delete' | 'create' | 'update' | 'query'
) {
  const args = { operation, session: context.session, listKey: list.listKey, context };
  // Check the mutation access
  const access = list.access.operation[operation];
  let result;
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    result = await access(args);
  } catch (error: any) {
    throw extensionError('权限控制', [{ error, tag: `${list.listKey}.access.operation.${args.operation}` }]);
  }

  const resultType = typeof result;

  // It's important that we don't cast objects to truthy values, as there's a strong chance that the user
  // has accidentally tried to return a filter.
  // 不要将对象强制转换为真值，因为很有可能返回的是一个过滤器
  if (resultType !== 'boolean') {
    throw accessReturnError([{ tag: `${args.listKey}.access.operation.${args.operation}`, returned: resultType }]);
  }

  return result;
}

export async function getAccessFilters(
  list: InitialisedList,
  context: PickerContext,
  operation: keyof typeof list.access.filter
): Promise<boolean | InputFilter> {
  try {
    let filters;
    if (operation === 'query') {
      filters = await list.access.filter.query({
        operation,
        session: context.session,
        listKey: list.listKey,
        context
      });
    } else if (operation === 'update') {
      filters = await list.access.filter.update({
        operation,
        session: context.session,
        listKey: list.listKey,
        context
      });
    } else if (operation === 'delete') {
      filters = await list.access.filter.delete({
        operation,
        session: context.session,
        listKey: list.listKey,
        context
      });
    }

    if (typeof filters === 'boolean') return filters;
    if (!filters) return false; // shouldn't happen, but, Typescript

    const schema = context.sudo().graphql.schema;
    const whereInput = assertInputObjectType(schema.getType(getGqlNames(list).whereInputName));
    const result = coerceAndValidateForGraphQLInput(schema, whereInput, filters);
    if (result.kind === 'valid') return result.value;
    throw result.error;
  } catch (error: any) {
    throw extensionError('权限控制', [{ error, tag: `${list.listKey}.access.filter.${operation.toString()}` }]);
  }
}

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
export type ListAccessControl<ListTypeInfo extends BaseListTypeInfo> =
  | ListAccessControlFunction<ListTypeInfo>
  | ListAccessControlObject<ListTypeInfo>;

type ListAccessControlFunction<ListTypeInfo extends BaseListTypeInfo> = (
  args: BaseAccessArgs<ListTypeInfo> & { operation: AccessOperation }
) => MaybePromise<boolean>;

type ListAccessControlObject<ListTypeInfo extends BaseListTypeInfo> = {
  // These functions should return `true` if access is allowed or `false` if access is denied.
  operation:
    | ListOperationAccessControl<AccessOperation, ListTypeInfo>
    | {
        query: ListOperationAccessControl<'query', ListTypeInfo>;
        create: ListOperationAccessControl<'create', ListTypeInfo>;
        update: ListOperationAccessControl<'update', ListTypeInfo>;
        delete: ListOperationAccessControl<'delete', ListTypeInfo>;
      };

  // The 'filter' rules can return either:
  // - a filter. In this case, the operation can proceed, but the filter will be additionally applied when updating/reading/deleting
  //   which may make it appear that some of the items don't exist.
  // - boolean true/false. If false, treated as a filter that never matches.
  filter?: {
    query?: ListFilterAccessControl<'query', ListTypeInfo>;
    // create?: not supported
    update?: ListFilterAccessControl<'update', ListTypeInfo>;
    delete?: ListFilterAccessControl<'delete', ListTypeInfo>;
  };

  // These rules are applied to each item being operated on individually. They return `true` or `false`,
  // and if false, an access denied error will be returned for the individual operation.
  item?: {
    // read?: not supported
    create?: CreateListItemAccessControl<ListTypeInfo>;
    update?: UpdateListItemAccessControl<ListTypeInfo>;
    delete?: DeleteListItemAccessControl<ListTypeInfo>;
  };
};

export function parseFieldAccessControl(
  access: FieldAccessControl<BaseListTypeInfo> | undefined
): ResolvedFieldAccessControl {
  if (typeof access === 'function') {
    return { read: access, create: access, update: access };
  }

  return {
    read: access?.read ?? (() => true),
    create: access?.create ?? (() => true),
    update: access?.update ?? (() => true)
  };
}

// Field Access
export type ResolvedListAccessControl = {
  operation: {
    query: ListOperationAccessControl<'query', BaseListTypeInfo>;
    create: ListOperationAccessControl<'create', BaseListTypeInfo>;
    update: ListOperationAccessControl<'update', BaseListTypeInfo>;
    delete: ListOperationAccessControl<'delete', BaseListTypeInfo>;
  };
  filter: {
    query: ListFilterAccessControl<'query', BaseListTypeInfo>;
    // create: not supported
    update: ListFilterAccessControl<'update', BaseListTypeInfo>;
    delete: ListFilterAccessControl<'delete', BaseListTypeInfo>;
  };
  item: {
    // query: not supported
    create: CreateListItemAccessControl<BaseListTypeInfo>;
    update: UpdateListItemAccessControl<BaseListTypeInfo>;
    delete: DeleteListItemAccessControl<BaseListTypeInfo>;
  };
};

export type ResolvedFieldAccessControl = {
  create: IndividualFieldAccessControl<FieldCreateItemAccessArgs<BaseListTypeInfo>>;
  read: IndividualFieldAccessControl<FieldReadItemAccessArgs<BaseListTypeInfo>>;
  update: IndividualFieldAccessControl<FieldUpdateItemAccessArgs<BaseListTypeInfo>>;
};

export function parseListAccessControl(access: ListAccessControl<BaseListTypeInfo>): ResolvedListAccessControl {
  if (typeof access === 'function') {
    return {
      operation: {
        query: access,
        create: access,
        update: access,
        delete: access
      },
      filter: {
        query: () => true,
        update: () => true,
        delete: () => true
      },
      item: {
        create: () => true,
        update: () => true,
        delete: () => true
      }
    };
  }

  // eslint-disable-next-line prefer-const
  let { operation, filter, item } = access;
  if (typeof operation === 'function') {
    operation = {
      query: operation,
      create: operation,
      update: operation,
      delete: operation
    };
  }

  return {
    operation: {
      query: operation.query ?? (() => true),
      create: operation.create ?? (() => true),
      update: operation.update ?? (() => true),
      delete: operation.delete ?? (() => true)
    },
    filter: {
      query: filter?.query ?? (() => true),
      // create: not supported
      update: filter?.update ?? (() => true),
      delete: filter?.delete ?? (() => true)
    },
    item: {
      // query: not supported
      create: item?.create ?? (() => true),
      update: item?.update ?? (() => true),
      delete: item?.delete ?? (() => true)
    }
  };
}
