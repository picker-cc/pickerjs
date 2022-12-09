import { ResolvedDBField } from '../resolve-relationships';
import { DatabaseProvider, ScalarDBField, ScalarDBFieldDefault } from '../types';
import { InitialisedList } from '../types-for-lists';
import { getDBFieldKeyForFieldOnMultiField } from '../utils';

function areArraysEqual(a: readonly unknown[], b: readonly unknown[]) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

const modifiers = {
  required: '',
  optional: '?',
  many: '[]'
};

function printIndex(fieldPath: string, index: undefined | 'index' | 'unique') {
  return {
    none: '',
    unique: '@unique',
    index: `\n@@index([${fieldPath}])`
  }[index || ('none' as const)];
}

function printNativeType(nativeType: string | undefined, datasourceName: string) {
  return nativeType === undefined ? '' : ` @${datasourceName}.${nativeType}`;
}

// eslint-disable-next-line consistent-return
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

// eslint-disable-next-line max-params
export function printField(
  fieldPath: string,
  field: Exclude<ResolvedDBField, { kind: 'none' }>,
  datasourceName: string,
  lists: Record<string, InitialisedList>
): string {
  if (field.kind === 'scalar') {
    const nativeType = printNativeType(field.nativeType, datasourceName);
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default ? ` @default(${printScalarDefaultValue(field.default)})` : '';
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : '';
    const updatedAt = field.updatedAt ? ' @updatedAt' : '';
    return `${fieldPath} ${field.scalar}${modifiers[field.mode]}${updatedAt}${nativeType}${defaultValue}${map}${index}`;
  }
  if (field.kind === 'enum') {
    const index = printIndex(fieldPath, field.index);
    const defaultValue = field.default ? ` @default(${field.default.value})` : '';
    const map = field.map ? ` @map(${JSON.stringify(field.map)})` : '';
    return `${fieldPath} ${field.name}${modifiers[field.mode]}${defaultValue}${map}${index}`;
  }
  if (field.kind === 'multi') {
    return (
      Object.entries(field.fields)
        // eslint-disable-next-line @typescript-eslint/no-shadow
        .map(([subField, field]) =>
          printField(getDBFieldKeyForFieldOnMultiField(fieldPath, subField), field, datasourceName, lists)
        )
        .join('\n')
    );
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
    const index = printIndex(relationIdFieldPath, field.foreignIdField.kind === 'owned' ? 'index' : 'unique');
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
              // eslint-disable-next-line @typescript-eslint/no-shadow
              ([key, field]) => [field, `${listKey}.${fieldPath} (sub field ${key})`] as const
            )
          : [[field, `${listKey}.${fieldPath}`] as const];

      // eslint-disable-next-line @typescript-eslint/no-shadow
      for (const [field, ref] of fields) {
        // eslint-disable-next-line no-continue
        if (field.kind !== 'enum') continue;
        const alreadyExistingEnum = enums[field.name];
        if (alreadyExistingEnum === undefined) {
          enums[field.name] = {
            values: field.values,
            firstDefinedByRef: ref
          };
          // eslint-disable-next-line no-continue
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
    throw new Error(`id 字段必须是 String 或 Int Prisma scalar，但是 ${listKey} 列表的 id 字段不是 scalar`);
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

// eslint-disable-next-line max-params
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
        prismaSchema += `\n${printField(fieldPath, field, provider, lists)}`;
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
