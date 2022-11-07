import { GraphQLResolveInfo } from 'graphql';
import {
  InputFilter,
  PrismaFilter, resolveUniqueWhereInput,
  resolveWhereInput,
  UniqueInputFilter,
  UniquePrismaFilter
} from "../../types/filters/where-inputs";
import { getDBFieldKeyForFieldOnMultiField, InitialisedList } from "../../prisma/prisma-schema";
import { checkFilterOrderAccess } from "../../types/filters/filter-order-access";
import { limitsExceededError, prismaError, userInputError } from "../../error/graphql-errors";
import { getAccessFilters, getOperationAccess } from "../access-control";
import {BaseItem,PickerContext, FindManyArgsValue, OrderDirection} from "../../types";
declare const prisma: unique symbol;

export type PrismaPromise<T> = Promise<T> & { [prisma]: true };

type PrismaModel = {
  count: (arg: {
    where?: PrismaFilter;
    take?: number;
    skip?: number;
    // this is technically wrong because relation orderBy but we're not doing that yet so it's fine
    orderBy?: readonly Record<string, 'asc' | 'desc'>[];
  }) => PrismaPromise<number>;
  findMany: (arg: {
    where?: PrismaFilter;
    take?: number;
    skip?: number;
    // this is technically wrong because relation orderBy but we're not doing that yet so it's fine
    orderBy?: readonly Record<string, 'asc' | 'desc'>[];
    include?: Record<string, boolean>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem[]>;
  delete: (arg: { where: UniquePrismaFilter }) => PrismaPromise<BaseItem>;
  deleteMany: (arg: { where: PrismaFilter }) => PrismaPromise<BaseItem>;
  findUnique: (args: {
    where: UniquePrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem | null>;
  findFirst: (args: {
    where: PrismaFilter;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem | null>;
  create: (args: {
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem>;
  update: (args: {
    where: UniquePrismaFilter;
    data: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) => PrismaPromise<BaseItem>;
};

export type UnwrapPromise<TPromise extends Promise<any>> = TPromise extends Promise<infer T>
    ? T
    : never;

export type UnwrapPromises<T extends Promise<any>[]> = {
    // unsure about this conditional
    [Key in keyof T]: Key extends number ? UnwrapPromise<T[Key]> : never;
};

// please do not make this type be the value of KeystoneContext['prisma']
// this type is meant for generic usage, KeystoneContext should be generic over a PrismaClient
// and we should generate a KeystoneContext type in node_modules/.picker-cc/types which passes in the user's PrismaClient type
// so that users get right PrismaClient types specifically for their project
export type PrismaClient = {
    $disconnect(): Promise<void>;
    $connect(): Promise<void>;
    $transaction<T extends PrismaPromise<any>[]>(promises: [...T]): UnwrapPromises<T>;
} & Record<string, PrismaModel>;


// Run prisma operations as part of a resolver
export async function runWithPrisma<T>(
  context: PickerContext,
  { listKey }: InitialisedList,
  fn: (model: PrismaModel) => Promise<T>
) {
  const model = context.prisma[listKey[0].toLowerCase() + listKey.slice(1)];
  try {
    return await fn(model);
  } catch (err: any) {
    throw prismaError(err);
  }
}

// we want to put the value we get back from the field's unique where resolver into an equals
// rather than directly passing the value as the filters (even though Prisma supports that), we use equals
// because we want to disallow fields from providing an arbitrary filters
export function mapUniqueWhereToWhere(uniqueWhere: UniquePrismaFilter): PrismaFilter {
  // inputResolvers.uniqueWhere validates that there is only one key
  const key = Object.keys(uniqueWhere)[0];
  const val = uniqueWhere[key];
  return { [key]: { equals: val } };
}

function traverseQuery(
  list: InitialisedList,
  context: PickerContext,
  inputFilter: InputFilter,
  filterFields: Record<string, { fieldKey: string; list: InitialisedList }>
) {
  // Recursively traverse a where filters to find all the fields which are being
  // filtered on.
  Object.entries(inputFilter).forEach(([fieldKey, value]) => {
    if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
      value.forEach((value: any) => {
        traverseQuery(list, context, value, filterFields);
      });
    } else if (fieldKey === 'some' || fieldKey === 'none' || fieldKey === 'every') {
      traverseQuery(list, context, value, filterFields);
    } else {
      filterFields[`${list.listKey}.${fieldKey}`] = { fieldKey, list };
      // If it's a relationship, check the nested filters.
      const field = list.fields[fieldKey];
      if (field.dbField.kind === 'relation' && value !== null) {
        const foreignList = field.dbField.list;
        traverseQuery(list.lists[foreignList], context, value, filterFields);
      }
    }
  });
}

export async function checkFilterAccess(
  list: InitialisedList,
  context: PickerContext,
  inputFilter: InputFilter
) {
  if (!inputFilter) return;
  const filterFields: Record<string, { fieldKey: string; list: InitialisedList }> = {};
  traverseQuery(list, context, inputFilter, filterFields);
  await checkFilterOrderAccess(Object.values(filterFields), context, 'filter');
}

export async function accessControlledFilter(
  list: InitialisedList,
  context: PickerContext,
  resolvedWhere: PrismaFilter,
  accessFilters: boolean | InputFilter
) {
  // Merge the filters access control
  if (typeof accessFilters === 'object') {
    resolvedWhere = { AND: [resolvedWhere, await resolveWhereInput(accessFilters, list, context)] };
  }

  return resolvedWhere;
}

export async function findOne(
  args: { where: UniqueInputFilter },
  list: InitialisedList,
  context: PickerContext
) {
  // Check operation permission to pass into single operation
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return null;
  }

  const accessFilters = await getAccessFilters(list, context, 'query');
  if (accessFilters === false) {
    return null;
  }

  // Validate and resolve the input filters
  const uniqueWhere = await resolveUniqueWhereInput(args.where, list.fields, context);
  const resolvedWhere = mapUniqueWhereToWhere(uniqueWhere);

  // Check filters access
  const fieldKey = Object.keys(args.where)[0];
  await checkFilterOrderAccess([{ fieldKey, list }], context, 'filter');

  // Apply access control
  // const filters = await accessControlledFilter(list, context, resolvedWhere,accessFilters);
  const filter = await accessControlledFilter(list, context, resolvedWhere, accessFilters);
  return runWithPrisma(context, list, model => model.findFirst({ where: filter }));
}

export async function findMany(
  { where, take, skip, orderBy: rawOrderBy }: FindManyArgsValue,
  list: InitialisedList,
  context: PickerContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
): Promise<BaseItem[]> {
  const orderBy = await resolveOrderBy(rawOrderBy, list, context);

  // Check operation permission, throw access denied if not allowed
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return [];
  }

  const accessFilters = await getAccessFilters(list, context, 'query');
  if (accessFilters === false) {
    return [];
  }

  applyEarlyMaxResults(take, list);

  let resolvedWhere = await resolveWhereInput(where, list, context);

  // Check filters access
  await checkFilterAccess(list, context, where);

  resolvedWhere = await accessControlledFilter(list, context, resolvedWhere, accessFilters);

  const results = await runWithPrisma(context, list, model =>
    model.findMany({
      where: extraFilter === undefined ? resolvedWhere : { AND: [resolvedWhere, extraFilter] },
      orderBy,
      take: take ?? undefined,
      skip,
    })
  );

  applyMaxResults(results, list, context);

  // if (info.cacheControl && list.cacheHint) {
  //   info.cacheControl.setCacheHint(
  //     list.cacheHint({ results, operationName: info.operation.name?.value, meta: false }) as any
  //   );
  // }
  return results;
}

async function resolveOrderBy(
  orderBy: readonly Record<string, any>[],
  list: InitialisedList,
  context: PickerContext
): Promise<readonly Record<string, OrderDirection>[]> {
  // Check input format. FIXME: Group all errors
  orderBy.forEach(orderBySelection => {
    const keys = Object.keys(orderBySelection);
    if (keys.length !== 1) {
      throw userInputError(
        `Only a single key must be passed to ${list.types.orderBy.graphQLType.name}`
      );
    }

    const fieldKey = keys[0];
    const value = orderBySelection[fieldKey];
    if (value === null) {
      throw userInputError('null cannot be passed as an order direction');
    }
  });

  // Check orderBy access
  const orderByKeys = orderBy.map(orderBySelection => ({
    fieldKey: Object.keys(orderBySelection)[0],
    list,
  }));
  await checkFilterOrderAccess(orderByKeys, context, 'orderBy');

  return await Promise.all(
    orderBy.map(async orderBySelection => {
      const keys = Object.keys(orderBySelection);
      const fieldKey = keys[0];
      const value = orderBySelection[fieldKey];
      const field = list.fields[fieldKey];
      const resolve = field.input!.orderBy!.resolve;
      const resolvedValue = resolve ? await resolve(value, context) : value;
      if (field.dbField.kind === 'multi') {
        // Note: no built-in field types support multi valued database fields *and* orderBy.
        // This code path is only relevent to custom fields which fit that criteria.
        const keys = Object.keys(resolvedValue);
        if (keys.length !== 1) {
          throw new Error(
            `Only a single key must be returned from an orderBy input resolver for a multi db field`
          );
        }
        const innerKey = keys[0];
        return {
          [getDBFieldKeyForFieldOnMultiField(fieldKey, innerKey)]: resolvedValue[innerKey],
        };
      } else {
        return { [fieldKey]: resolvedValue };
      }
    })
  );
}

export async function count(
  { where }: { where: Record<string, any> },
  list: InitialisedList,
  context: PickerContext,
  info: GraphQLResolveInfo,
  extraFilter?: PrismaFilter
) {
  // Check operation permission, return zero if not allowed
  const operationAccess = await getOperationAccess(list, context, 'query');
  if (!operationAccess) {
    return 0;
  }

  const accessFilters = await getAccessFilters(list, context, 'query');
  if (accessFilters === false) {
    return 0;
  }

  let resolvedWhere = await resolveWhereInput(where, list, context);

  // Check filters access
  await checkFilterAccess(list, context, where);

  resolvedWhere = await accessControlledFilter(list, context, resolvedWhere, accessFilters);

  const count = await runWithPrisma(context, list, model =>
    model.count({
      where: extraFilter === undefined ? resolvedWhere : { AND: [resolvedWhere, extraFilter] },
    })
  );
  // if (info.cacheControl && list.cacheHint) {
  //   info.cacheControl.setCacheHint(
  //     list.cacheHint({
  //       results: count,
  //       operationName: info.operation.name?.value,
  //       meta: true,
  //     }) as any
  //   );
  // }
  return count;
}

function applyEarlyMaxResults(_take: number | null | undefined, list: InitialisedList) {
  const take = Math.abs(_take ?? Infinity);
  // We want to help devs by failing fast and noisily if limits are violated.
  // Unfortunately, we can't always be sure of intent.
  // E.g., if the query has a "take: 10", is it bad if more results could come back?
  // Maybe yes, or maybe the dev is just paginating posts.
  // But we can be sure there's a problem in two cases:
  // * The query explicitly has a "take" that exceeds the limit
  // * The query has no "take", and has more results than the limit
  if (take < Infinity && take > list.maxResults) {
    throw limitsExceededError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
}

function applyMaxResults(results: unknown[], list: InitialisedList, context: PickerContext) {
  if (results.length > list.maxResults) {
    throw limitsExceededError({ list: list.listKey, type: 'maxResults', limit: list.maxResults });
  }
  if (context) {
    context.totalResults += results.length;
    if (context.totalResults > context.maxTotalResults) {
      throw limitsExceededError({
        list: list.listKey,
        type: 'maxTotalResults',
        limit: context.maxTotalResults,
      });
    }
  }
}
