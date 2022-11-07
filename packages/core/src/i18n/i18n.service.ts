import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Handler, Request } from 'express';
import * as fs from 'fs';
import type { GraphQLError } from 'graphql';
import type { TFunction } from 'i18next';
import i18next from 'i18next';
// import i18nextMiddleware from 'i18next-express-middleware';
// https://github.com/i18next/i18next-http-middleware
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';
import ICU from 'i18next-icu';
import path from 'path';

import { Logger } from '../config';

import { I18nError } from './i18n-error';

/**
 * @description
 * 用于多语言翻译的I18资源
 *
 * @docsCategory Translation
 */
export interface PickerTranslationResources {
  error: any;
  errorResult: any;
  message: any;
}

export interface I18nRequest extends Request {
  t: TFunction;
}

/**
 * 该服务负责在消息到达客户端之前翻译来自服务器的消息。
 * `i18next-express-middleware`中间件检测客户端的首选语言
 * `Accept-Language` Header 或 "lang" 查询参数，并添加语言特定的翻译函数到 Express request / response 对象。
 * @docsCategory Translation
 */
@Injectable()
export class I18nService implements OnModuleInit {
  /**
   * @internal
   * @param configService
   */
  // constructor(private configService: ConfigService) {}

  /**
   * @internal
   */
  onModuleInit() {
    // eslint-disable-next-line import/no-named-as-default-member,@typescript-eslint/ban-ts-comment
    // @ts-ignore
    return i18next
      .use(Backend as any)
      .use(i18nextMiddleware.LanguageDetector)
      .use(ICU as any)
      .init({
        compatibilityJSON: 'v3',
        backend: {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          loadPath: (lng: any, namespace: any) => {
            const customPath = path.join(__dirname, `messages/${lng}.json`);
            return customPath;
          },
          // loadPath: '/Users/baisheng/_Caixie/picker-cc/packages/core/dist/i18n/messages/en.json',
          jsonIndent: 2
        },
        debug: false,
        // initImmediate: false,
        // lng: 'en',
        // lng: 'zh_Hans',
        // preload: readdirSync(path.join(__dirname, 'messages')).filters((fileName) => {
        //     const joinedPath = path.join(path.join(__dirname, 'messages'), fileName)
        //     const isDirectory = fs.lstatSync(joinedPath).isDirectory()
        //     return isDirectory
        // }),
        fallbackLng: 'zh_Hans',
        preload: ['en', 'zh_Hans'],
        detection: {
          lookupQuerystring: 'languageCode'
        }
        // resources: {
        //     en: {
        //         translation: {
        //             "haha": "你好。。。。hello world"
        //         }
        //     }
        // }
      });
    // .then(function (t) {
    // console.log('初始化多语言成功。。。。')
    // console.log('hello')
    // console.log(t('error.forbidden'))
    // });
  }

  /**
   * @internal
   */
  handle(): Handler {
    return i18nextMiddleware.handle(i18next, {});
  }

  /**
   * @description
   * 添加一个基于 json 的 I18n 翻译文件
   *
   * @param langKey language key of the I18n translation file
   * @param filePath path to the I18n translation file
   */
  addTranslationFile(langKey: string, filePath: string): void {
    try {
      const rawData = fs.readFileSync(filePath);
      const resources = JSON.parse(rawData.toString('utf-8'));
      this.addTranslation(langKey, resources);
    } catch (err) {
      Logger.error(`Could not load resources file ${filePath}`, `I18nService`);
    }
  }

  /**
   * @description
   * 添加一个 I18n 转换 (key-value) 资源
   *
   * @param langKey language key of the I18n translation file
   * @param resources key-value translations
   */
  addTranslation(langKey: string, resources: PickerTranslationResources | any): void {
    i18next.addResourceBundle(langKey, 'translation', resources, true, true);
  }

  /**
   * 如果是i18error的实例，则转换originalError。
   * @internal
   */
  translateError(req: I18nRequest, error: GraphQLError) {
    const originalError = error.originalError;
    const t: TFunction = req.t;
    // console.log(t('errorResult.EMAIL_ADDRESS_CONFLICT_ERROR'))
    if (t && originalError instanceof I18nError) {
      let translation = originalError.message;
      try {
        translation = t(originalError.message, originalError.variables);
      } catch (e: any) {
        translation += ` (Translation format error: ${e.message})`;
      }
      error.message = translation;
      // 我们现在可以安全地删除变更对象，这样它们就不会出现在
      // GraphQL API 返回的错误
      delete (originalError as any).variables;
    }

    return error;
  }

  /**
   * 转换 ErrorResult 的消息
   * @internal
   */
  translateErrorResult(req: I18nRequest, error: any) {
    const t: TFunction = req.t;
    let translation: string = error.message;
    const key = `errorResult.${error.message}`;
    try {
      translation = t(key, error as any) as any;
    } catch (e: any) {
      translation += ` (Translation format error: ${e.message})`;
    }
    error.message = translation;
  }
}
