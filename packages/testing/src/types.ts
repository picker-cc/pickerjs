/**
 * 创建具有只读属性的类型的可变版本。
 */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/**
 * @description
 * 用于初始化{@link TestServer}.实例的配置选项
 */
export interface TestServerOptions {
    logging?: boolean;
}

export type QueryParams = { [key: string]: string | number };
