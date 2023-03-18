import { CacheHint } from '@apollo/cache-control-types';
import type { MaybePromise } from '../utils';
import { BaseListTypeInfo, PickerContextFromListTypeInfo } from '../type-info';
import type { ListAccessControl } from '../../core';
import type { ListHooks } from './hooks';
import type { BaseFields, FilterOrderArgs } from './fields';

export type ListSchemaConfig = Record<string, ListConfig<any, BaseFields<BaseListTypeInfo>>>;

export type IdFieldConfig =
  | { kind: 'cuid' | 'uuid' }
  | {
  kind: 'autoincrement';
  /**
   * 配置数库 id 字段的类型。SQLite 只支持 `Int`
   * @default 'Int'
   */
  type?: 'Int' | 'BigInt';
};

export type ListConfig<ListTypeInfo extends BaseListTypeInfo, Fields extends BaseFields<ListTypeInfo>> = {
  isSingleton?: boolean;
  fields: Fields;

  /**
   * 控制Admin UI和GraphQL的用户可以访问和更改哪些数据
   * @default true
   */
  access: ListAccessControl<ListTypeInfo>;

  /** 配置该列表在 Admin UI 中应该如何操作 */
  ui?: ListAdminUIConfig<ListTypeInfo, Fields>;

  /**
   * 钩子来修改GraphQL操作在某些点的行为
   */
  hooks?: ListHooks<ListTypeInfo>;

  graphql?: ListGraphQLConfig;

  db?: ListDBConfig;

  /**
   * Admin UI 的默认描述
   */
  description?: string; // defaults both { adminUI: { description }, graphQL: { description } }

  // Defaults to apply to all fields.
  // 默认应用于所有字段
  defaultIsFilterable?: false | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>); // The default value to use for graphql.isEnabled.filter on all fields for this list
  defaultIsOrderable?: false | ((args: FilterOrderArgs<ListTypeInfo>) => MaybePromise<boolean>); // The default value to use for graphql.isEnabled.orderBy on all fields for this list
};

export type ListAdminUIConfig<ListTypeInfo extends BaseListTypeInfo, Fields extends BaseFields<ListTypeInfo>> = {
  /**
   * The field to use as a label in the Admin UI. If you want to base the label off more than a single field, use a virtual field and reference that field here.
   * @default 'label', if it exists, falling back to 'name', then 'title', and finally 'id', which is guaranteed to exist.
   */
  /**
   * 在Admin UI中用作标签的字段。如果希望以多个字段作为标签的基础，请使用一个虚拟字段并在此引用该字段
   * @default 'label'，如果它存在，返回到 `name`，然后是 `title`，最后是 id，以保证它的存在
   */
  // labelField?: 'id' | keyof Fields;
  labelField?: 'id' | Exclude<keyof Fields, number>;
  /**
   * 非 `id` 的用于字段过滤的配置
   * @default `labelField` 如果它有一个字符串 `contains` 过滤器
   */
  searchFields?: readonly Extract<keyof Fields, string>[];

  /**
   * 列表描述
   * @default listConfig.description
   */
  description?: string; // 这个描述会显示在 Admin UI 的字段下方

  /**
   * 从 Admin UI 中排除此列表
   * @default false
   */
  isHidden?: MaybeSessionFunction<boolean, ListTypeInfo>;
  /**
   * 隐藏 Admin UI 中的创建按钮
   * 注意：这并不是 **not** 禁用通过 GraphQL API 创建项目，它只是隐藏了 Admin UI 中的创建按钮
   * @default false
   */
  hideCreate?: MaybeSessionFunction<boolean, ListTypeInfo>;
  /**
   * Hides the delete button in the Admin UI.
   * 隐藏 Admin UI 中的删除按钮
   * 注意：这并不是 **not** 禁用通过 GraphQL API 删除项目，它只是隐藏了 Admin UI 中的创建按钮
   * @default false
   */
  hideDelete?: MaybeSessionFunction<boolean, ListTypeInfo>;
  /**
   * Admin UI 中个性化创建视图的配置
   */
  createView?: {
    /**
     * 此列表的 create 视图中的字段的默认模式。通过字段配置，个性化每个字段的特定模式。
     * @default 'edit'
     */
    defaultFieldMode?: MaybeSessionFunction<'edit' | 'hidden', ListTypeInfo>;
  };

  /**
   * Admin UI 中个性化配置项目视图
   */
  itemView?: {
    /**
     * 此列表的项目中的字段默认配置，这具体控制到字段可以做什么。
     * @default 'edit'
     */
    defaultFieldMode?: MaybeItemFunction<'edit' | 'read' | 'hidden', ListTypeInfo>;
  };

  /**
   * Configuration specific to the list view in the Admin UI
   */
  listView?: {
    /**
     * 此列表中的列表视图中的默认字段模式，通过字段的配置，个性化每个字段的特定模式。
     * @default 'read'
     */
    defaultFieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo>;
    /**
     * 应该显示给 Admin UI 用户的列（指字段）
     * Admin UI 的用户可以选择不同的列表显示在 UI 中
     * @default 列表中的前三个字段
     */
    initialColumns?: readonly ('id' | keyof Fields)[];
    // 默认排序
    initialSort?: { field: 'id' | keyof Fields; direction: 'ASC' | 'DESC' };
    // 默认分页大小
    pageSize?: number; // default number of items to display per page on the list screen
  };

  /**
   * 用于在导航中识别列表的标签
   * @default listKey.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s|_|\-/).filter(i => i).map(upcase).join(' ');
   */
  label?: string;

  /**
   * The singular form of the list key.
   * 列表键的单数列式
   *
   * 它被用于像 `你达到要删除这些 {plural} 吗`，批量删除使用
   * @default pluralize.singular(label)
   */
  singular?: string;

  /**
   * 列表键的复数形式
   * 它被用于像 `你确定要删除这个 {singular} 吗？` 这样的句子中。
   * @default pluralize.plural(label)
   */
  plural?: string;

  /**
   * The path segment to identify the list in URLs.
   *
   * It must match the pattern `/^[a-z-_][a-z0-9-_]*$/`.
   * @default label.split(' ').join('-').toLowerCase()
   */
  path?: string;
};

export type MaybeSessionFunction<T extends string | boolean, ListTypeInfo extends BaseListTypeInfo> =
  | T
  | ((args: { session: any; context: PickerContextFromListTypeInfo<ListTypeInfo> }) => MaybePromise<T>);

export type MaybeItemFunction<T, ListTypeInfo extends BaseListTypeInfo> =
  | T
  | ((args: {
  session: any;
  context: PickerContextFromListTypeInfo<ListTypeInfo>;
  item: ListTypeInfo['item'];
}) => MaybePromise<T>);

export interface ListGraphQLConfig {
  /**
   * The description added to the GraphQL schema
   * @default listConfig.description
   */
  description?: string;
  /**
   * The plural form of the list key to use in the generated GraphQL schema.
   * Note that there is no singular here because the singular used in the GraphQL schema is the list key.
   */
  // was previously top-level listQueryName
  plural?: string;
  // was previously top-level queryLimits
  // queryLimits?: {
  //   maxResults?: number; // maximum number of items that can be returned in a query (or subquery)
  // };
  maxTake?: number;
  cacheHint?: ((args: CacheHintArgs) => CacheHint) | CacheHint;
  // Setting any of these values will remove the corresponding operations from the GraphQL schema.
  // Queries:
  //   'query':  Does item()/items() exist?
  // Mutations:
  //   'create': Does createItem/createItems exist? Does `create` exist on the RelationshipInput types?
  //   'update': Does updateItem/updateItems exist?
  //   'delete': Does deleteItem/deleteItems exist?
  // If `true`, then everything will be omitted, including the output type. This makes it a DB only list,
  // including from the point of view of relationships to this list.
  //
  // Default: undefined
  omit?: true | readonly ('query' | 'create' | 'update' | 'delete')[];
}

export type CacheHintArgs = {
  results: any;
  operationName?: string;
  meta: boolean;
};

export type ListDBConfig = {
  /**
   * The kind of id to use.
   * @default { kind: "cuid" }
   */
  idField?: IdFieldConfig;
  /**
   * 指定要使用的表的替代名，生成的是数据库表名，默认值是从列表键中派生
   */
  map?: string;
};
