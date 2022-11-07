/**
 * 深度的 Partial<T> 类型的递归实现。
 * Source: https://stackoverflow.com/a/49936686/772859
 */
// import { LanguageCode } from "./generated-types";
export declare type DeepPartial<T> = {
    [P in keyof T]?: null | (T[P] extends Array<infer U> ? Array<DeepPartial<U>> : T[P] extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>> : DeepPartial<T[P]>);
};
/**
 * Required<T> 的递归实现。
 * Source: https://github.com/microsoft/TypeScript/issues/15012#issuecomment-365453623
 */
export declare type DeepRequired<T, U extends object | undefined = undefined> = T extends object ? {
    [P in keyof T]-?: NonNullable<T[P]> extends NonNullable<U | Function | Type<any>> ? NonNullable<T[P]> : DeepRequired<NonNullable<T[P]>, U>;
} : T;
/**
 * 表示类的类型而不是类的实例的类型。
 */
export declare type Type<T> = new (...args: any[]) => T;
export declare type Json = null | boolean | number | string | Json[] | {
    [prop: string]: Json;
};
/**
 * @description
 * 一种表示 JSON-compatible 兼容值的类型
 * From https://github.com/microsoft/TypeScript/issues/1897#issuecomment-580962081
 *
 * @docsCategory common
 */
export declare type JsonCompatible<T> = {
    [P in keyof T]: T[P] extends Json ? T[P] : Pick<T, P> extends Required<Pick<T, P>> ? never : JsonCompatible<T[P]>;
};
/**
 * 描述分页列表响应的数据类型
 */
export interface PaginatedList<T> {
    items: T[];
    totalItems: number;
}
/**
 * @description
 * 实体ID，根据配置的{@link EntityIdStrategy}，它将是一个 `string` 或 `number`。
 *
 * @docsCategory entities
 * @docsWeight 0
 */
export declare type ID = string | number;
/**
 * @description
 * 自定义字段的数据类型
 *
 * @docsCategory custom-fields
 */
export declare type CustomFieldType = 'string' | 'localeString' | 'int' | 'float' | 'boolean' | 'datetime';
/**
 * @description
 * 在配置对象{@lin CustomFields}中的实体上配置一个自定义字段。
 *
 * @docsCategory custom-fields
 */
export interface CustomFieldConfig {
    name: string;
    type: CustomFieldType;
}
/**
 * @description
 * 大多数实体都可以通过定义一个针对对应键的{@link CustomFieldConfig} 对象数组来添加额外的字段。
 *
 * @example
 * ```typescript
 * bootstrap({
 *     // ...
 *     customFields: {
 *         Product: [
 *             { name: 'infoUrl', type: 'string' },
 *             { name: 'downloadable', type: 'boolean' },
 *             { name: 'shortName', type: 'localeString' },
 *         ],
 *         User: [
 *             { name: 'socialLoginToken', type: 'string' },
 *         ],
 *     },
 * })
 * ```
 *
 * @docsCategory custom-fields
 */
export interface CustomFields {
    Address?: CustomFieldConfig[];
    Administrator: CustomFieldConfig[];
    Asset: CustomFieldConfig[];
    Customer?: CustomFieldConfig[];
    GlobalSettings?: CustomFieldConfig[];
    User?: CustomFieldConfig[];
}
/**
 * 这个接口应该由任何可以扩展自义字段的实体实现。
 */
export interface HasCustomFields {
    customFields: CustomFieldsObject;
}
export declare type MayHaveCustomFields = Partial<HasCustomFields>;
export interface CustomFieldsObject {
    [key: string]: any;
}
/**
 * 这个接口描述了 Admin UI 使用的 JSON 配置文件的格式。
 */
export interface AdminUiConfig {
    /**
     * @description
     * 配置 Admin UI 端调用 Picker 服务器 API的主机名，
     * 如果设置为 "auto"，Admin UI 应用程序读取本机地址 (即：`window.location.hostname`)
     * @default 'http://localhost'
     */
    apiHost: string | 'auto';
    /**
     * @description
     * Admin UI 端调用 Picker 服务器的端口，
     * 如果设置为 "auto"，Admin UI 应用程序将读取（即：`window.location.port`）
     *
     * @default 3000
     */
    apiPort: number | 'auto';
    /**
     * @description
     * Admin UI 应用程序的 GraphQL Admin API 路径
     *
     * @default 'admin-api'
     */
    adminApiPath: string;
    /**
     * @description
     * 是否使用 cookie 或 bearer token 令牌跟踪会话。
     * 选项应与服务器的 `authOptions.authTokenHeaderKey` 配置匹配。
     *
     * @default 'cookie'
     */
    tokenMethod: 'cookie' | 'bearer';
    /**
     * @description
     * 当使用 'bearer' auth 方法时使用的头文件。应该匹配服务器的
     * `authOptions.authTokenHeaderKey` 配置选项。
     *
     * @default 'picker-auth-token'
     */
    authTokenHeaderKey: string;
    /**
     * @description
     *
     * Admin UI 用户界面的默认语言。一定是在
     * `availableLanguages` 属中的指定项。
     *
     * @default LanguageCode.zh
     */
    // defaultLanguage: LanguageCode;
    /**
     * @description
     * Admin UI 中存在的多语言配置数组
     *
     * @default [LanguageCode.zh, LanguageCode.en]
     */
    // availableLanguages: LanguageCode[];
    /**
     * @description

     * 如果你在 Admin API 中使用外部的{@link AuthenticationStrategy}，
     * 你可以使用这个选项为登录页面配置一个自定义 URL。在注销或重定向一个未经身份验证的用户时，
     * Admin UI 应用程序将把用户重定向到这个 URL，而不是默认的用户名/密码验证页。
     */
    loginUrl?: string;
    /**
     * @description
     * 定制的品牌名称。
     */
    brand?: string;
    /**
     * @description
     * 选择隐藏 Picker 品牌名称在页面中
     *
     * @default false
     */
    hidePickerBranding?: boolean;
    /**
     * @description
     * 选择隐藏系统的版本
     *
     * @default false
     */
    hideVersion?: boolean;
}
/**
 * @description
 * 配置 Admin UI 应用程序的自定义构建路径
 *
 * @docsCategory common
 */
export interface AdminUiAppConfig {
    /**
     * @description
     * 已编译的 admin ui app 文件的路径。如果未指定，则使用内部默认构建。
     * 这个路径应该包含`picker-ui-config` Json
     * The path to the compiled admin ui app files. If not specified, an internal
     * default build is used. This path should contain the `vendure-ui-config.json` file,
     * index.html, the compiled js bundles etc.
     */
    path: string;
    /**
     * @description
     * 指定到Admin UI应用程序的url路由。
     *
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * 该函数将被调用以启动应用程序编译过程。
     */
    compile?: () => Promise<void>;
}
/**
 * @description
 * Admin UI app dev服务器的信息。
 *
 * @docsCategory common
 */
export interface AdminUiAppDevModeConfig {
    /**
     * @description
     * 未编译的ui app源文件的路径。这个路径应该包含 `venture -ui-config.json` 文件。
     */
    sourcePath: string;
    /**
     * @description
     * dev服务器正在监听的端口。覆盖 `AdminUiOptions.port` 设置的值。
     */
    port: number;
    /**
     * @description
     * 指定到 Admin UI 应用程序的 url 路由。
     * @default 'admin'
     */
    route?: string;
    /**
     * @description
     * 该函数将被调用以启动应用程序编译过程。
     */
    compile: () => Promise<void>;
}
export {};
