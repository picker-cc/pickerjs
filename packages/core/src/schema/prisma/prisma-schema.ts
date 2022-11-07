
import Decimal from 'decimal.js';
import { ResolvedFieldAccessControl, ResolvedListAccessControl } from "../core/access-control";
import { CacheHint } from "apollo-server-types";
import {FilterOrderArgs} from "../types/config/fields";
import {ResolvedRelationDBField} from "../resolve-relationships";
import {
    BaseListTypeInfo,
    GqlNames,
    GraphQLTypesForList, JSONValue,
    ListHooks,
    MaybePromise,
    NextFieldType, ScalarDBField,
    ScalarDBFieldDefault
} from "../types";
export type DatabaseProvider = 'sqlite' | 'postgresql' | 'mysql';

// TODO: don't duplicate this between here and packages/core/ListTypes/list.js
export function getGqlNames({
                              listKey,
                              pluralGraphQLName,
                            }: {
  listKey: string;
  pluralGraphQLName: string;
}): GqlNames {
  const lowerPluralName = pluralGraphQLName.slice(0, 1).toLowerCase() + pluralGraphQLName.slice(1);
  const lowerSingularName = listKey.slice(0, 1).toLowerCase() + listKey.slice(1);
  const names = {
    outputTypeName: listKey,
    itemQueryName: lowerSingularName,
    listQueryName: lowerPluralName,
    listQueryCountName: `${lowerPluralName}Count`,
    listOrderName: `${listKey}OrderByInput`,
    deleteMutationName: `delete${listKey}`,
    updateMutationName: `update${listKey}`,
    createMutationName: `create${listKey}`,
    deleteManyMutationName: `delete${pluralGraphQLName}`,
    updateManyMutationName: `update${pluralGraphQLName}`,
    createManyMutationName: `create${pluralGraphQLName}`,
    whereInputName: `${listKey}WhereInput`,
    whereUniqueInputName: `${listKey}WhereUniqueInput`,
    updateInputName: `${listKey}UpdateInput`,
    createInputName: `${listKey}CreateInput`,
    updateManyInputName: `${listKey}UpdateArgs`,
    relateToManyForCreateInputName: `${listKey}RelateToManyForCreateInput`,
    relateToManyForUpdateInputName: `${listKey}RelateToManyForUpdateInput`,
    relateToOneForCreateInputName: `${listKey}RelateToOneForCreateInput`,
    relateToOneForUpdateInputName: `${listKey}RelateToOneForUpdateInput`,
  };
  return names
}


export type InitialisedField = Omit<NextFieldType, 'dbField' | 'access' | 'graphql'>  & {
  dbField: ResolvedDBField;
  access: ResolvedFieldAccessControl;
  hooks: any;
  graphql: {
    isEnabled: {
      read: boolean;
      create: boolean;
      update: boolean;
      filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
      orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
    };
    cacheHint?: CacheHint | undefined;
  };
};

export type InitialisedList = {
  fields: Record<string, InitialisedField>;
  /** This will include the opposites to one-sided relationships */
  resolvedDbFields: Record<string, ResolvedDBField>;
  pluralGraphQLName: string;
  types: GraphQLTypesForList;
  access: ResolvedListAccessControl;
  hooks: ListHooks<BaseListTypeInfo>;
  adminUILabels: any;
  cacheHint: any;
  maxResults: number;
  listKey: string;
  lists: Record<string, InitialisedList>;
  dbMap: string | undefined;
  graphql: {
    isEnabled: IsEnabled;
  };

};


type IsEnabled = {
  type: boolean;
  query: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  filter: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
  orderBy: boolean | ((args: FilterOrderArgs<BaseListTypeInfo>) => MaybePromise<boolean>);
};


type ScalarPrismaTypes = {
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  BigInt: bigint;
  Json: JSONValue;
  Decimal: Decimal;
};
export type EnumDBField<Value extends string, Mode extends 'required' | 'many' | 'optional'> = {
  kind: 'enum';
  name: string;
  values: readonly Value[];
  mode: Mode;
  default?: { kind: 'literal'; value: Value };
  index?: 'unique' | 'index';
  map?: string;
};
export type RelationDBField<Mode extends 'many' | 'one'> = {
  kind: 'relation';
  list: string;
  field?: string;
  mode: Mode;
  foreignKey?: { one: true | { map: string }; many: undefined }[Mode];
  relationName?: { one: undefined; many: string }[Mode];
};

export type NoDBField = { kind: 'none' };

export type RealDBField = ScalarishDBField | RelationDBField<'many' | 'one'>;

export type MultiDBField<Fields extends Record<string, ScalarishDBField>> = {
  kind: 'multi';
  fields: Fields;
};
export type ScalarishDBField =
  | ScalarDBField<keyof ScalarPrismaTypes, 'required' | 'many' | 'optional'>
  | EnumDBField<string, 'required' | 'many' | 'optional'>;

export type DBField = RealDBField | NoDBField | MultiDBField<Record<string, ScalarishDBField>>;

export type ResolvedDBField =
  | ResolvedRelationDBField
  | ScalarishDBField
  | NoDBField
  | MultiDBField<Record<string, ScalarishDBField>>;

export function getDBFieldKeyForFieldOnMultiField(fieldKey: string, subField: string) {
  return `${fieldKey}_${subField}`;
}

function areArraysEqual(a: readonly unknown[], b: readonly unknown[]) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

const modifiers = {
  required: '',
  optional: '?',
  many: '[]',
};

function printIndex(fieldPath: string, index: undefined | 'index' | 'unique') {
  return {
    none: '',
    unique: '@unique',
    index: `\n@@index([${fieldPath}])`,
  }[index || ('none' as const)];
}

function printNativeType(nativeType: string | undefined, datasourceName: string) {
  return nativeType === undefined ? '' : ` @${datasourceName}.${nativeType}`;
}

function printScalarDefaultValue(defaultValue: ScalarDBFieldDefault): string {
  if (defaultValue.kind === 'literal') {
    if (typeof defaultValue.value === 'string') {
      return JSON.stringify(defaultValue.value);
    }
    return defaultValue.value.toString();
  }
  if (
    defaultValue.kind === 'now' ||
    defaultValue.kind === 'autoincrement' ||
    defaultValue.kind === 'cuid' ||
    defaultValue.kind === 'uuid'
  ) {
    return `${defaultValue.kind}()`;
  }
  if (defaultValue.kind === 'dbgenerated') {
    return `dbgenerated(${JSON.stringify(defaultValue.value)})`;
  }
  assertNever(defaultValue);
}

function assertNever(arg: never): never {
  throw new Error(`expected to never be called but was called with ${arg}`);
}

export function printField(
  fieldPath: string,
  field: Exclude<ResolvedDBField, { kind: 'none' }>,
  datasourceName: string,
  lists: Record<string, InitialisedList>
): string {
  if (field.kind === 'scalar') {
    const nativeType = printNativeType(field.nativeType, datasourceName);
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default
      ? ` @default(${printScalarDefaultValue(field.default)})`
      : '';
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : '';
    const updatedAt = field.updatedAt ? ' @updatedAt' : '';
    return `${fieldPath} ${field.scalar}${
      modifiers[field.mode]
    }${updatedAt}${nativeType}${defaultValue}${map}${index}`;
  }
  if (field.kind === 'enum') {
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default ? ` @default(${field.default.value})` : '';
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : '';
    return `${fieldPath} ${field.name}${modifiers[field.mode]}${defaultValue}${map}${index}`;
  }
  if (field.kind === 'multi') {
    return Object.entries(field.fields)
      .map(([subField, field]) =>
        printField(
          getDBFieldKeyForFieldOnMultiField(fieldPath, subField),
          field,
          datasourceName,
          lists
        )
      )
      .join('\n');
  }
  if (field.kind === 'relation') {
    if (field.mode === 'many') {
      return `${fieldPath} ${field.list}[] @relation("${field.relationName}")`;
    }
    if (field.foreignIdField.kind === 'none') {
      return `${fieldPath} ${field.list}? @relation("${field.relationName}")`;
    }
    const relationIdFieldPath = `${fieldPath}Id`;
    const relationField = `${fieldPath} ${field.list}? @relation("${field.relationName}", fields: [${relationIdFieldPath}], references: [id])`;
    const foreignIdField = lists[field.list].resolvedDbFields.id;
    assertDbFieldIsValidForIdField(field.list, foreignIdField);
    const nativeType = printNativeType(foreignIdField.nativeType, datasourceName);
    const index = printIndex(
      relationIdFieldPath,
      field.foreignIdField.kind === 'owned' ? 'index' : 'unique'
    );
    const relationIdField = `${relationIdFieldPath} ${foreignIdField.scalar}? @map(${JSON.stringify(
      field.foreignIdField.map
    )}) ${nativeType}${index}`;
    return `${relationField}\n${relationIdField}`;
  }
  // TypeScript's control flow analysis doesn't understand that this will never happen without the assertNever
  // (this will still correctly validate if any case is unhandled though)
  return assertNever(field);
}

function collectEnums(lists: Record<string, InitialisedList>) {
  const enums: Record<string, { values: readonly string[]; firstDefinedByRef: string }> = {};
  for (const [listKey, { resolvedDbFields }] of Object.entries(lists)) {
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      const fields =
        field.kind === 'multi'
          ? Object.entries(field.fields).map(
              ([key, field]) => [field, `${listKey}.${fieldPath} (sub field ${key})`] as const
            )
          : [[field, `${listKey}.${fieldPath}`] as const];

      for (const [field, ref] of fields) {
        if (field.kind !== 'enum') continue;
        const alreadyExistingEnum = enums[field.name];
        if (alreadyExistingEnum === undefined) {
          enums[field.name] = {
            values: field.values,
            firstDefinedByRef: ref,
          };
          continue;
        }
        if (!areArraysEqual(alreadyExistingEnum.values, field.values)) {
          throw new Error(
            `The fields ${alreadyExistingEnum.firstDefinedByRef} and ${ref} both specify Prisma schema enums` +
              `with the name ${field.name} but they have different values:\n` +
              `enum from ${alreadyExistingEnum.firstDefinedByRef}:\n${JSON.stringify(
                alreadyExistingEnum.values,
                null,
                2
              )}\n` +
              `enum from ${ref}:\n${JSON.stringify(field.values, null, 2)}`
          );
        }
      }
    }
  }
  return Object.entries(enums)
    .map(([enumName, { values }]) => `enum ${enumName} {\n${values.join('\n')}\n}`)
    .join('\n');
}

function assertDbFieldIsValidForIdField(
  listKey: string,
  field: ResolvedDBField
): asserts field is ScalarDBField<'Int' | 'String', 'required'> {
  if (field.kind !== 'scalar') {
    throw new Error(
      `id 字段必须是 String 或 Int Prisma scalar，但是 ${listKey} 列表的 id 字段不是 scalar`
    );
  }
  // this may be loosened in the future
  if (field.scalar !== 'String' && field.scalar !== 'Int' && field.scalar !== 'BigInt') {
    throw new Error(
      `id 字段必须是 String, Int 或 BigInt 类型，但 ${listKey} 列表的 id 字段是 ${field.scalar} 标量类型（scalar）`
    );
  }
  if (field.mode !== 'required') {
    throw new Error(
      `id 字段必须是一个单独的必填字段，但是 ${listKey} 列表的 id 字段是 ${
        field.mode === 'many' ? 'many' : 'optional'
      } 字段`
    );
  }
  if (field.index !== undefined) {
    throw new Error(
      `id 字段不能自已指定索引，但是 ${listKey} 列表的 id 字段指定了索引`
      // `id fields must not specify indexes themselves but the id field for the ${listKey} list specifies an index`
    );
  }
  // this will likely be loosened in the future
  if (field.default === undefined) {
    throw new Error(
      `id 字段必须指定 Prisma/database 级别的默认值，但${listKey} 列表的 id 字段没有指定`
      // `id fields must specify a Prisma/database level default value but the id field for the ${listKey} list does not`
    );
  }
}

export function printPrismaSchema(
  lists: Record<string, InitialisedList>,
  provider: DatabaseProvider,
  prismaPreviewFeatures?: readonly string[] | null,
  additionalPrismaDatasourceProperties?: { [key: string]: string } | null
) {
  const additionalDataSourceString = Object.entries(additionalPrismaDatasourceProperties || {})
    .map(([key, value]) => `\n    ${key} = "${value}"`)
    .join('');

  let prismaFlags = '';
  if (prismaPreviewFeatures && prismaPreviewFeatures.length) {
    prismaFlags = `\n    previewFeatures = ["${prismaPreviewFeatures.join('","')}"]`;
  }
  let prismaSchema = `// 该文件由 Picker 自动生成，请勿手动修改。当您需要修改 Picker 配置时，请修改 Picker config。

datasource ${provider} {
  url               = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  provider          = "${provider}"${additionalDataSourceString}
}

generator client {
  provider = "prisma-client-js"
  output   = "node_modules/.prisma/client"${prismaFlags}
}
\n`;
  for (const [listKey, { resolvedDbFields, dbMap }] of Object.entries(lists)) {
    prismaSchema += `model ${listKey} {`;
    for (const [fieldPath, field] of Object.entries(resolvedDbFields)) {
      if (field.kind !== 'none') {
        prismaSchema += '\n' + printField(fieldPath, field, provider, lists);
      }
      if (fieldPath === 'id') {
        assertDbFieldIsValidForIdField(listKey, field);
        prismaSchema += ' @id';
      }
    }
    if (dbMap !== undefined) {
      prismaSchema += `\n@@map(${JSON.stringify(dbMap)})`;
    }
    prismaSchema += `\n}\n`;
  }
  prismaSchema += `\n${collectEnums(lists)}\n`;

  return prismaSchema;
}
