import {
    filters,
    graphql,
    BaseModelTypeInfo,
    CommonFieldConfig,
    FieldData,
    FieldTypeFunc,
    Decimal,
    fieldType,
    orderDirectionEnum,
    ImageData,
    ImageExtension,
    PickerContext, JSONValue
} from "../../../types";
import {jsonFieldTypePolyfilledForSQLite} from "../../../types/json-field-type-polyfill-for-sqlite";

export type JsonFieldConfig<ModelTypeInfo extends BaseModelTypeInfo> =
    CommonFieldConfig<ModelTypeInfo> & {
    defaultValue?: JSONValue;
    db?: { map?: string };
};

export const json =
    <ModelTypeInfo extends BaseModelTypeInfo>({
                                                  defaultValue = null,
                                                  ...config
                                              }: JsonFieldConfig<ModelTypeInfo> = {}): FieldTypeFunc<ModelTypeInfo> =>
        meta => {
            if ((config as any).isIndexed === 'unique') {
                throw Error("isIndexed: 'unique' is not a supported option for field type json");
            }

            return jsonFieldTypePolyfilledForSQLite(
                meta.provider,
                {
                    ...config,
                    input: {
                        create: {
                            arg: graphql.arg({ type: graphql.JSON }),
                            resolve(val) {
                                return val === undefined ? defaultValue : val;
                            },
                        },
                        update: { arg: graphql.arg({ type: graphql.JSON }) },
                    },
                    output: graphql.field({ type: graphql.JSON }),
                    views: '@picker-cc/core/fields/types/json/views',
                    getAdminMeta: () => ({ defaultValue }),
                },
                {
                    default:
                        defaultValue === null
                            ? undefined
                            : { kind: 'literal', value: JSON.stringify(defaultValue) },
                    map: config.db?.map,
                }
            );
        };
