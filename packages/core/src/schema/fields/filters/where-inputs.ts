import { DBField, PickerContext } from '../../types';
import { InitialisedList } from '../../types-for-lists';
import { userInputError } from '../../error/graphql-errors';
import { getDBFieldKeyForFieldOnMultiField } from '../../utils';

export type InputFilter = Record<string, any> & {
  _____?: 'input filter';
  AND?: InputFilter[];
  OR?: InputFilter[];
  NOT?: InputFilter[];
};
export type PrismaFilter = Record<string, any> & {
  _____?: 'prisma filter';
  AND?: PrismaFilter[] | PrismaFilter;
  OR?: PrismaFilter[] | PrismaFilter;
  NOT?: PrismaFilter[] | PrismaFilter;
  // just so that if you pass an array to something expecting a PrismaFilter, you get an error
  // 如果将一个数组传递给一个 PrismaFilter，将会得到一个错误
  length?: undefined;
  // so that if you pass a promise, you get an error
  then?: undefined;
};

export type UniqueInputFilter = Record<string, any> & { _____?: 'unique input filter' };
export type UniquePrismaFilter = Record<string, any> & {
  _____?: 'unique prisma filter';
  // so that if you pass a promise, you get an error
  then?: undefined;
};

export async function resolveUniqueWhereInput(
  input: UniqueInputFilter,
  list: InitialisedList,
  context: PickerContext
): Promise<UniquePrismaFilter> {
  const inputKeys = Object.keys(input);
  if (inputKeys.length !== 1) {
    throw userInputError(`只有一个键必需要以唯一的方式传递，其中 input 不是 ${inputKeys.length} 键被传递`);
  }
  const key = inputKeys[0];
  const val = input[key];
  if (list.isSingleton && (key !== 'id' || val !== '1')) {
    throw userInputError(`对于单例列表，id 字段的输入应该是 '1'`);
  }
  if (val === null) {
    throw userInputError(`在 unique 中提供的唯一值，其中 input 不能为空`);
  }
  const resolver = list.fields[key].input!.uniqueWhere!.resolve;
  return { [key]: resolver ? await resolver(val, context) : val };
}

export async function resolveWhereInput(
  inputFilter: InputFilter,
  list: InitialisedList,
  context: PickerContext,
  isAtRootWhere = true
): Promise<PrismaFilter> {
  if (isAtRootWhere && list.isSingleton && inputFilter?.id?.equals !== '1') {
    throw userInputError(`对于单例列表，id 字段的输入应该是 '1'`);
  }
  return {
    AND: await Promise.all(
      Object.entries(inputFilter).map(async ([fieldKey, value]) => {
        if (fieldKey === 'OR' || fieldKey === 'AND' || fieldKey === 'NOT') {
          return {
            [fieldKey]: await Promise.all(value.map((value: any) => resolveWhereInput(value, list, context, false)))
          };
        }
        const field = list.fields[fieldKey];
        // we know if there are filters in the input object with the key of a field, the field must have defined a where input so this non null assertion is okay
        // 如果在输入对象中有一个字段 key 的过滤器，该字段必须定义了一个 where input，所以这个非空断言是可以的
        const where = field.input!.where!;
        const dbField = field.dbField;
        const ret = where.resolve
          ? await where.resolve(
              value,
              context,
              (() => {
                if (field.dbField.kind !== 'relation') {
                  return undefined as any;
                }
                const foreignList = field.dbField.list;
                const whereResolver = (val: any) => resolveWhereInput(val, list.lists[foreignList], context);
                if (field.dbField.mode === 'many') {
                  return async () => {
                    if (value === null) {
                      throw userInputError('多关系筛选器不能设置为空');
                    }
                    return Object.fromEntries(
                      await Promise.all(
                        Object.entries(value).map(async ([key, val]) => {
                          if (val === null) {
                            // The key "${key}" in a many relation filter cannot be set to null
                            throw userInputError(`多关系过滤器中的键 ${key} 不能设置为空`);
                          }
                          return [key, await whereResolver(val)];
                        })
                      )
                    );
                  };
                }
                return (val: any) => {
                  if (val === null) {
                    return null;
                  }
                  return whereResolver(val);
                };
              })()
            )
          : value;
        if (ret === null) {
          if (field.dbField.kind === 'multi') {
            // Note: no built-in field types support multi valued database fields *and* filtering.
            // This code path is only relevent to custom fields which fit that criteria.
            throw new Error('多个 db 字段不能从输入解析器返回 null');
          }
          return { [fieldKey]: null };
        }
        return handleOperators(fieldKey, dbField, ret);
      })
    )
  };
}

function handleOperators(fieldKey: string, dbField: DBField, { AND, OR, NOT, ...rest }: any) {
  return {
    AND: AND?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    OR: OR?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    NOT: NOT?.map((value: any) => handleOperators(fieldKey, dbField, value)),
    ...nestWithAppropiateField(fieldKey, dbField, rest)
  };
}

function nestWithAppropiateField(fieldKey: string, dbField: DBField, value: any) {
  if (dbField.kind === 'multi') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [getDBFieldKeyForFieldOnMultiField(fieldKey, key), val])
    );
  }
  return { [fieldKey]: value };
}
