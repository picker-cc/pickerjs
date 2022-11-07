// import { PickerMongoEntity } from '../../entity/base/mongo-base.entity';
import { Type } from '@picker-cc/common/lib/shared-types';
// import {Tag} from "../../entity/tag/tag.entity";
import {LogicalOperator} from "@picker-cc/common/lib/generated-types";

/**
 * @description
 * 可以软件删除的实体应该实现该接口
 *
 * @docsCategory entities
 * @docsPage interfaces
 */
export interface SoftDeletable {
  deletedAt: Date | null;
}

/**
 * @description
 * 在一个列表中需要排序的实体应该实现该接口
 *
 * @docsCategory entities
 * @docsPage interfaces
 */
export interface Orderable {
  position: number;
}

/**
 * @description
 * 实体需要标签的时候应该实现该接口
 *
 * @docsCategory entities
 * @docsPage interfaces
 */
// export interface Taggable {
//     tags: Tag[];
// }

/**
 * 创建一个基于 T 的类型，但所有属性都是非可选的和只读的。
 */
export type ReadOnlyRequired<T> = { +readonly [K in keyof T]-?: T[K] };

/**
 * 给定一个数组类型，例如Array<string>，返回内部类型，例如 string。
 */
export type UnwrappedArray<T extends any[]> = T[number];

/**
 * 列表查询的参数
 */
export interface ListQueryOptions<T extends any> {
  take?: number | null;
  skip?: number | null;
  sort?: NullOptionals<SortParameter<T>> | null;
  filter?: NullOptionals<FilterParameter<T>> | null;
  filterOperator?: LogicalOperator;
}

/**
 * 返回类型 T，其中任何可选字段也添加了 "null" 类型。
 * 这是需要提供互相操作与 Apollo-generated 接口，其中可空字段有类型 `field?: <type> | null`。
 */
export type NullOptionals<T> = {
  [K in keyof T]: undefined extends T[K] ? NullOptionals<T[K]> | null : NullOptionals<T[K]>
};

export type SortOrder = 'ASC' | 'DESC';

// prettier-ignore
export type PrimitiveFields<T extends any> = {
  [K in keyof T]: T[K] extends number | string | boolean | Date ? K : never
}[keyof T];
//
// prettier-ignore
export type SortParameter<T extends any> = {
  [K in PrimitiveFields<T>]?: SortOrder
};

// prettier-ignore
export type CustomFieldSortParameter = {
  [customField: string]: SortOrder;
};

// prettier-ignore
export type FilterParameter<T extends any> = {
  [K in PrimitiveFields<T>]?: T[K] extends string ? StringOperators
    : T[K] extends number ? NumberOperators
      : T[K] extends boolean ? BooleanOperators
        : T[K] extends Date ? DateOperators : StringOperators;
};

export interface StringOperators {
  eq?: string;
  notEq?: string;
  like?: string;
  // contains?: string;
  // notContains?: string;
  in?: string[];
  notIn?: string[];
  regex?: string;
}

export interface BooleanOperators {
  eq?: boolean;
}

export interface NumberRange {
  start: number;
  end: number;
}

export interface NumberOperators {
  eq?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  between?: NumberRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateOperators {
  eq?: Date;
  before?: Date;
  after?: Date;
  between?: DateRange;
}

// tslint:disable-next-line:ban-types
export type MiddlewareHandler = Type<any> | Function;

/**
 * @description
 * 定义 API 中间件，在 {@link ApiOptions} 中设置，中间件可以是：
 * [Express middleware](https://expressjs.com/en/guide/using-middleware.html) 或 [NestJS
 * middleware](https://docs.nestjs.com/middleware).
 *
 * @docsCategory Common
 */
export interface Middleware {
    /**
     * @description
     * The Express middleware function or NestJS `NestMiddleware` class.
     * Express 中间件函数或 NestJS 的 `NestMiddleware` 类。
     */
    handler: MiddlewareHandler;
    /**
     * @description
     * The route to which this middleware will apply. Pattern based routes are supported as well.
     * 此中间件将应用于路由，也支持基于模式的路由
     *
     * `'ab*cd'` 路由路径将匹配 `abcd`，`ab_cd`，`abecd`等，字符 `?`，`+`，`*`，和 `()` 可用于一个路由路径和它们对应的正则表达式的子集。
     * 连字符（`-`）和点（`.`）按字面意思解释。
     */
    route: string;
    /**
     * @description
     * 当设置为 `true` 时，这将导致中间件在 Picker 服务器（和底层 Express 服务器）开始监听之前应用为连接。
     * 在实践中，这意味着中间件将处于中间件堆栈的最开始，甚至在 `body-parser` 中间件是由 NestJS 自动应用的。
     * 这在某些情况下很有用，比如当您需要访问对特定跌幅的原始解析请求。
     * @default false
     */
    beforeListen?: boolean;
}
