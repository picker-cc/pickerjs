import { BaseListTypeInfo, FieldTypeFunc, CommonFieldConfig, fieldType } from '../../../types';
import { graphql } from '../../../types/schema';

// import { getAdminMetaForRelationshipField } from '../../../admin-ui/system/createAdminMeta';

// This is the default display mode for Relationships
type SelectDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a Select field
    displayMode?: 'select';
    /**
     * The path of the field to use from the related list for item labels in the select.
     * Defaults to the labelField configured on the related list.
     */
    labelField?: string;
    searchFields?: string[];
  };
};

type CardsDisplayConfig = {
  ui?: {
    // Sets the relationship to display as a list of Cards
    displayMode: 'cards';
    /* The set of fields to render in the default Card component **/
    cardFields: readonly string[];
    /** Causes the default Card component to render as a link to navigate to the related item */
    linkToItem?: boolean;
    /** Determines whether removing a related item in the UI will delete or unlink it */
    removeMode?: 'disconnect' | 'none'; // | 'delete';
    /** Configures inline create mode for cards (alternative to opening the create modal) */
    inlineCreate?: { fields: readonly string[] };
    /** Configures inline edit mode for cards */
    inlineEdit?: { fields: readonly string[] };
    /** Configures whether a select to add existing items should be shown or not */
    inlineConnect?:
      | boolean
      | {
          /**
           * The path of the field to use from the related list for item labels in the inline connect
           * Defaults to the labelField configured on the related list.
           */
          labelField: string;
          searchFields?: string[];
        };
  };
};

type CountDisplayConfig = {
  many: true;
  ui?: {
    // Sets the relationship to display as a count
    displayMode: 'count';
  };
};

type OneDbConfig = {
  many?: false;
  db?: {
    foreignKey?:
      | true
      | {
          map: string;
        };
  };
};

type ManyDbConfig = {
  many: true;
  db?: {
    relationName?: string;
  };
};

export type RelationshipFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<ListTypeInfo> & {
  many?: boolean;
  ref: string;
  ui?: {
    hideCreate?: boolean;
  };
} & (OneDbConfig | ManyDbConfig) &
  (SelectDisplayConfig | CardsDisplayConfig | CountDisplayConfig);

export const relationship =
  <ListTypeInfo extends BaseListTypeInfo>({
    ref,
    ...config
  }: RelationshipFieldConfig<ListTypeInfo>): FieldTypeFunc<ListTypeInfo> =>
  ({ fieldKey, listKey, lists }) => {
    const { many = false } = config;
    const [foreignListKey, foreignFieldKey] = ref.split('.');
    const foreignList = lists[foreignListKey];
    if (!foreignList) {
      throw new Error(`Unable to resolve list '${foreignListKey}' for field ${listKey}.${fieldKey}`);
    }
    const foreignListTypes = foreignList.types;

    const commonConfig = {
      ...config,
      __pickerTelemetryFieldTypeName: '@pickerjs/relationship',
      views: '@pickerjs/core/fields/types/relationship/views',
      getAdminMeta: (): any => {}
    };

    if (config.many) {
      return fieldType({
        kind: 'relation',
        mode: 'many',
        list: foreignListKey,
        field: foreignFieldKey,
        relationName: config.db?.relationName
      })({
        ...commonConfig,
        input: {
          where: {
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.where }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            resolve(value, context, resolve) {
              return resolve(value);
            }
          },
          create: foreignListTypes.relateTo.many.create && {
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.create }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async resolve(value, context, resolve) {
              return resolve(value);
            }
          },
          update: foreignListTypes.relateTo.many.update && {
            arg: graphql.arg({ type: foreignListTypes.relateTo.many.update }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async resolve(value, context, resolve) {
              return resolve(value);
            }
          }
        },
        output: graphql.field({
          args: foreignListTypes.findManyArgs,
          type: graphql.list(graphql.nonNull(foreignListTypes.output)),
          resolve({ value }, args) {
            return value.findMany(args);
          }
        }),
        extraOutputFields: {
          [`${fieldKey}Count`]: graphql.field({
            type: graphql.Int,
            args: {
              where: graphql.arg({
                type: graphql.nonNull(foreignListTypes.where),
                defaultValue: {}
              })
            },
            resolve({ value }, args) {
              return value.count({
                where: args.where
              });
            }
          })
        }
      });
    }

    return fieldType({
      kind: 'relation',
      mode: 'one',
      list: foreignListKey,
      field: foreignFieldKey,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      foreignKey: config.db?.foreignKey
    })({
      ...commonConfig,
      input: {
        where: {
          arg: graphql.arg({ type: foreignListTypes.where }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          resolve(value, context, resolve) {
            return resolve(value);
          }
        },
        create: foreignListTypes.relateTo.one.create && {
          arg: graphql.arg({ type: foreignListTypes.relateTo.one.create }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async resolve(value, context, resolve) {
            return resolve(value);
          }
        },

        update: foreignListTypes.relateTo.one.update && {
          arg: graphql.arg({ type: foreignListTypes.relateTo.one.update }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async resolve(value, context, resolve) {
            return resolve(value);
          }
        }
      },
      output: graphql.field({
        type: foreignListTypes.output,
        resolve({ value }) {
          return value();
        }
      })
    });
  };
