import { BaseModelTypeInfo, CommonFieldConfig, fieldType, FieldTypeFunc, orderDirectionEnum } from '../../../types';
import { humanize } from '../../../../utils/utils';
import { assertCreateIsNonNullAllowed, assertReadIsNonNullAllowed } from '../../non-null-graphql';
import { filters } from '../../filters';
import { graphql } from '../../../types/schema';

export type TextFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> = CommonFieldConfig<ModelTypeInfo> & {
  isIndexed?: true | 'unique';
  ui?: {
    displayMode?: 'input' | 'textarea';
  };
  validation?: {
    /**
     * Makes the field disallow null values and require a string at least 1 character long
     */
    isRequired?: boolean;
    match?: { regex: RegExp; explanation?: string };
    length?: { min?: number; max?: number };
  };
  defaultValue?: string;
  graphql?: { create?: { isNonNull?: boolean }; read?: { isNonNull?: boolean } };
  db?: {
    isNullable?: boolean;
    map?: string;
    /**
     * 基础数据库类型。
     * PostgreSQL和MySQL只支持其中的一些类型。在SQLite上不能自定义本机类型。
     * 有关受支持类型的更多信息，请参阅Prisma的文档。
     *
     * https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string
     */
    nativeType?:
      | 'String' // Mongodb
      | 'Text' // PostgreSQL and MySQL
      | `VarChar(${number})`
      | `Char(${number})`
      | `Bit(${number})` // PostgreSQL
      | 'VarBit'
      | 'Uuid'
      | 'Xml'
      | 'Inet'
      | 'Citext'
      | 'TinyText' // MySQL
      | 'MediumText'
      | 'LargeText';
  };
};
export const text =
  <ModelTypeInfo extends BaseModelTypeInfo>({
    isIndexed,
    defaultValue: _defaultValue,
    validation: _validation,
    ...config
  }: TextFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> =>
  // eslint-disable-next-line complexity
  meta => {
    for (const type of ['min', 'max'] as const) {
      const val = _validation?.length?.[type];
      if (val !== undefined && (!Number.isInteger(val) || val < 0)) {
        throw new Error(
          `The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.length.${type}: ${val} but it must be a positive integer`
        );
      }
      if (_validation?.isRequired && val !== undefined && val === 0) {
        throw new Error(
          `The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.${type}: 0, this is not allowed because validation.isRequired implies at least a min length of 1`
        );
      }
    }
    const validation = {
      ..._validation,
      length: {
        min: _validation?.isRequired ? _validation?.length?.min ?? 1 : _validation?.length?.min,
        max: _validation?.length?.max
      }
    };

    // const fieldType
    const isNullable = config.db?.isNullable ?? false;
    const fieldLabel = config.label ?? humanize(meta.fieldKey);
    assertReadIsNonNullAllowed(meta, config, isNullable);

    assertCreateIsNonNullAllowed(meta, config);

    const mode = isNullable ? 'optional' : 'required';
    const defaultValue = isNullable === false || _defaultValue !== undefined ? _defaultValue || '' : undefined;

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'String',
      default: defaultValue === undefined ? undefined : { kind: 'literal', value: defaultValue },
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      map: config.db?.map,
      nativeType: config.db?.nativeType
    })({
      ...config,
      hooks: {
        ...config.hooks,
        async validateInput(args) {
          const val = args.resolvedData[meta.fieldKey];
          if (val === null && (validation?.isRequired || isNullable === false)) {
            args.addValidationError(`${fieldLabel} 是必填的`);
          }
          if (val !== null) {
            if (validation?.length?.min !== undefined && val.length < validation.length.min) {
              if (validation.length.min === 1) {
                args.addValidationError(`${fieldLabel} 不能为空`);
              } else {
                args.addValidationError(`${fieldLabel} 字符长度不能小于 ${validation.length.min}`);
              }
            }
            if (validation?.length?.max !== undefined && val.length > validation.length.max) {
              args.addValidationError(`${fieldLabel} 字符长度不能超过 ${validation.length.max} `);
            }
            if (validation?.match && !validation.match.regex.test(val)) {
              args.addValidationError(
                validation.match.explanation || `${fieldLabel} 必须匹配 ${validation.match.regex}`
              );
            }
          }

          await config.hooks?.validateInput?.(args);
        }
      },
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
        where: {
          arg: graphql.arg({
            // type: null,
            type: filters[meta.provider].String[mode]
            // type: null
          }),
          resolve: mode === 'required' ? undefined : filters.resolveString
        },
        create: {
          arg: graphql.arg({
            type: config.graphql?.create?.isNonNull ? graphql.nonNull(graphql.String) : graphql.String,
            defaultValue: config.graphql?.create?.isNonNull ? defaultValue : undefined
          }),
          resolve(val) {
            if (val === undefined) {
              return defaultValue ?? null;
            }
            return val;
          }
        },
        update: {
          arg: graphql.arg({ type: graphql.String })
        },
        orderBy: {
          arg: graphql.arg({ type: orderDirectionEnum })
        }
      },
      output: graphql.field({
        type: config.graphql?.read?.isNonNull ? graphql.nonNull(graphql.String) : graphql.String
      }),
      views: '',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      getAdminMeta(): TextFieldMeta {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
          validation: {
            isRequired: validation?.isRequired ?? false,
            match: validation?.match
              ? {
                  regex: {
                    source: validation.match.regex.source,
                    flags: validation.match.regex.flags
                  },
                  explanation: validation.match.explanation ?? null
                }
              : null,
            length: { max: validation?.length?.max ?? null, min: validation?.length?.min ?? null }
          },
          defaultValue: defaultValue ?? (isNullable ? null : ''),
          isNullable
        };
      }
    });
  };

export interface TextFieldMeta {
  displayMode: 'input' | 'textarea';
  shouldUseModeInsensitive: boolean;
  isNullable: boolean;
  validation: {
    isRequired: boolean;
    match: { regex: { source: string; flags: string }; explanation: string | null } | null;
    length: { min: number | null; max: number | null };
  };
  defaultValue: string | null;
}
