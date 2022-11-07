import { LanguageCode } from '@picker-cc/common/lib/generated-types';
import { CustomFieldsObject, ID } from '@picker-cc/common/lib/shared-types';

// import { PickerMongoEntity } from '../../entity/base/mongo-base.entity';
// import { TranslatableRelationsKeys } from '../../service/helpers/utils/translate-entity';

import { UnwrappedArray } from './common-types';

/**
 * 该类型应该用于任何需要将值本化为不同语言的接口。
 */
export type LocaleString = string & { _opaqueType: 'LocaleString' };

export type TranslatableKeys<T, U = Omit<T, 'translations'>> = {
    [K in keyof U]: U[K] extends LocaleString ? K : never;
}[keyof U];

export type NonTranslateableKeys<T> = { [K in keyof T]: T[K] extends LocaleString ? never : K }[keyof T];

// prettier-ignore
/**
 * @description
 * 具有可本地化 localizable 字符串属性的实休应该实现这种类型
 *
 * @docsCategory entities
 * @docsPage interfaces
 */
export interface Translatable {
    translations: Array<Translation<any>>;
}

export type TranslationCustomFields<T> = { [K in keyof T]: K extends 'customFields' ? K : never }[keyof T];

// prettier-ignore
/**
 * 可本地化 localizable 实体的翻译应该实现这种类型
 */
export type Translation<T> =
    // 翻译必须包括 languageCOde 和对与之关联的可翻译基本实体的引用
    {
        id: ID;
        languageCode: LanguageCode;
        base: T;
    } &
    // 翻译必须包含所有可翻译的键作为字符串类型
    { [K in TranslatableKeys<T>]: string; } &
    { [K in TranslationCustomFields<T>]: CustomFieldsObject; };

/**
 * 这是作为创建或更新操作的输入提供的翻译对象类型
 */
export type TranslationInput<T> = { [K in TranslatableKeys<T>]?: string | null } & {
    id?: ID | null;
    languageCode: LanguageCode;
};

/**
 * 该接口定义了 DTO 的形状，用于创建/更新具有一个或多个 LocalString 属性的实体
 */
export interface TranslatedInput<T> {
    translations?: Array<TranslationInput<T>> | null;
}

// prettier-ignore
/**
 * 这是可翻译实体的深度翻译成给定语言后的类型。
 */
// export type Translated<T> = T & { languageCode: LanguageCode; } & {
//     [K in TranslatableRelationsKeys<T>]: T[K] extends any[] ? Array<Translated<UnwrappedArray<T[K]>>> : Translated<T[K]>;
// };
