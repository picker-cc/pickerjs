import {
    assertCreateIsNonNullAllowed,
    assertReadIsNonNullAllowed,
    getResolvedIsNullable,
} from '../../non-null-graphql';
import {
    filters,
    BaseModelTypeInfo,
    CommonFieldConfig,
    graphql,
    BaseItem,
    fieldType,
    FieldTypeFunc,
    ListGraphQLTypes,
    orderDirectionEnum
} from "../../../types";
import {humanize} from "../../../types-for-lists";

export type TimestampFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> =
    CommonFieldConfig<ModelTypeInfo> & {
    isIndexed?: boolean | 'unique';
    validation?: {
        isRequired?: boolean;
    };
    defaultValue?: string | { kind: 'now' };
    graphql?: {
        create?: { isNonNull?: boolean };
        read?: { isNonNull?: boolean };
    };
    db?: {
        updatedAt?: boolean;
        isNullable?: boolean;
        map?: string;
    };
};

export const timestamp =
    <ModelTypeInfo extends BaseModelTypeInfo>({
                                                  isIndexed,
                                                  validation,
                                                  defaultValue,
                                                  ...config
                                              }: TimestampFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> =>
        meta => {
            if (typeof defaultValue === 'string') {
                try {
                    graphql.DateTime.graphQLType.parseValue(defaultValue);
                } catch (err) {
                    throw new Error(
                        `The timestamp field at ${meta.modelKey}.${
                            meta.fieldKey
                        } specifies defaultValue: ${defaultValue} but values must be provided as a full ISO8601 date-time string such as ${new Date().toISOString()}`
                    );
                }
            }
            const parsedDefaultValue =
                typeof defaultValue === 'string'
                    ? (graphql.DateTime.graphQLType.parseValue(defaultValue) as Date)
                    : defaultValue;

            const resolvedIsNullable = getResolvedIsNullable(validation, config.db);

            assertReadIsNonNullAllowed(meta, config, resolvedIsNullable);

            assertCreateIsNonNullAllowed(meta, config);

            const mode = resolvedIsNullable === false ? 'required' : 'optional';

            const fieldLabel = config.label ?? humanize(meta.fieldKey);

            return fieldType({
                kind: 'scalar',
                mode,
                scalar: 'DateTime',
                index: isIndexed === true ? 'index' : isIndexed || undefined,
                default:
                    typeof defaultValue === 'string'
                        ? {
                            kind: 'literal',
                            value: defaultValue,
                        }
                        : defaultValue === undefined
                            ? undefined
                            : { kind: 'now' },
                updatedAt: config.db?.updatedAt,
                map: config.db?.map,
            })({
                ...config,
                hooks: {
                    ...config.hooks,
                    async validateInput(args) {
                        const value = args.resolvedData[meta.fieldKey];
                        if ((validation?.isRequired || resolvedIsNullable === false) && value === null) {
                            args.addValidationError(`${fieldLabel} is required`);
                        }

                        await config.hooks?.validateInput?.(args);
                    },
                },
                input: {
                    uniqueWhere:
                        isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.DateTime }) } : undefined,
                    where: {
                        arg: graphql.arg({ type: filters[meta.provider].DateTime[mode] }),
                        resolve: mode === 'optional' ? filters.resolveCommon : undefined,
                    },
                    create: {
                        arg: graphql.arg({
                            type: config.graphql?.create?.isNonNull
                                ? graphql.nonNull(graphql.DateTime)
                                : graphql.DateTime,
                            defaultValue:
                                config.graphql?.create?.isNonNull && parsedDefaultValue instanceof Date
                                    ? parsedDefaultValue
                                    : undefined,
                        }),
                        resolve(val) {
                            if (val === undefined) {
                                if (parsedDefaultValue === undefined && config.db?.updatedAt) {
                                    return undefined;
                                }
                                if (parsedDefaultValue instanceof Date || parsedDefaultValue === undefined) {
                                    // @ts-ignore
                                    val = parsedDefaultValue ?? null;
                                } else {
                                    val = new Date();
                                }
                            }
                            return val;
                        },
                    },
                    update: { arg: graphql.arg({ type: graphql.DateTime }) },
                    orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
                },
                output: graphql.field({
                    type: config.graphql?.read?.isNonNull
                        ? graphql.nonNull(graphql.DateTime)
                        : graphql.DateTime,
                }),
                views: 'timestamp/views',
                getAdminMeta(): TimestampFieldMeta {
                    return {
                        defaultValue: defaultValue ?? null,
                        isRequired: validation?.isRequired ?? false,
                        updatedAt: config.db?.updatedAt ?? false,
                    };
                },
            });
        };
export type TimestampFieldMeta = {
    defaultValue: string | { kind: 'now' } | null;
    updatedAt: boolean;
    isRequired: boolean;
};
