// import { ApolloError } from 'apollo-server-core';
import { GraphQLError } from 'graphql';
import { LogLevel } from '../config';
/**
 * @description
 * 在 Picker 服务器中所有错误的抛出必需要使用或扩展这个错误类。这允许错误消息在送达客户端之前被翻译。
 *
 * 错误信息应该以对应的字符串 key 的形式提供，并在 `i18n/messages/<languageCode>.json` 中定义键。
 *
 * 注意：这个抽象类不应该直接在代码中使用，应该被扩展成一个更具体的 Error 类。
 *
 * @docsCategory errors
 */
export abstract class I18nError extends GraphQLError {
  protected constructor(
    public message: string,
    public variables: { [key: string]: string | number } = {},
    public code?: string,
    public logLevel: LogLevel = LogLevel.Warn
  ) {
    super(message, {
      extensions: {
        code
      }
    });
  }
}
