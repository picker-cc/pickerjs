import chalk from 'chalk';

import {Logger, LogLevel, PickerLogger} from './picker-logger';

const DEFAULT_CONTEXT = 'Picker Server';

/**
 * 默认日志实现
 *
 * @example
 * ```ts
 * import { DefaultLogger, LogLevel, PickerConfig } from '\@picker/core';
 *
 * export config: PickerConfig = {
 *     // ...
 *     logger: new DefaultLogger({ level: LogLevel.Debug, timestamp: false }),
 * }
 * ```
 */
export class DefaultLogger implements PickerLogger {
  /** @internal */
  level: LogLevel = LogLevel.Info;
  private readonly timestamp: boolean;
  private defaultContext = DEFAULT_CONTEXT;
  private readonly localeStringOptions = {
    year: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
  };
  private static originalLogLevel: LogLevel;

  constructor(options?: { level?: LogLevel; timestamp?: boolean }) {
    this.level = options && options.level != null ? options.level : LogLevel.Info;
    this.timestamp = options && options.timestamp !== undefined ? options.timestamp : true;
  }

  /**
   * @description
   * 在启动AppModule时隐藏Nest生成的信息层日志的解决方案。
   * 在“bootstrap()”函数中调用“NestFactory.create()”之前直接运行。
   *
   * See https://github.com/nestjs/nest/issues/1838
   * @internal
   */
  static hideNestBoostrapLogs(): void {
    const {logger} = Logger;
    if (logger instanceof DefaultLogger) {
      if (logger.level === LogLevel.Info) {
        this.originalLogLevel = LogLevel.Info;
        logger.level = LogLevel.Warn;
      }
    }
  }

  /**
   * @description
   *如果日志级别被' hideNestBoostrapLogs() '更改，则此方法将恢复
   *原始日志级别。方法中的“NestFactory.create()”调用后直接运行
   *的引导()函数。
   *
   * See https://github.com/nestjs/nest/issues/1838
   * @internal
   */
  static restoreOriginalLogLevel(): void {
    const {logger} = Logger;
    if (logger instanceof DefaultLogger && DefaultLogger.originalLogLevel !== undefined) {
      logger.level = DefaultLogger.originalLogLevel;
    }
  }

  setDefaultContext(defaultContext: string) {
    this.defaultContext = defaultContext;
  }

  error(message: string, context?: string, trace?: string | undefined): void {
    if (this.level >= LogLevel.Error) {
      this.logMessage(
        chalk.red(`error`),
        chalk.red(this.ensureString(message) + (trace ? `\n${trace}` : '')),
        context,
      );
    }
  }

  warn(message: string, context?: string): void {
    if (this.level >= LogLevel.Warn) {
      this.logMessage(chalk.yellow(`warn`), chalk.yellow(this.ensureString(message)), context);
    }
  }

  info(message: string, context?: string): void {
    if (this.level >= LogLevel.Info) {
      this.logMessage(chalk.blue(`info`), this.ensureString(message), context);
    }
  }

  verbose(message: string, context?: string): void {
    if (this.level >= LogLevel.Verbose) {
      this.logMessage(chalk.magenta(`verbose`), this.ensureString(message), context);
    }
  }

  debug(message: string, context?: string): void {
    if (this.level >= LogLevel.Debug) {
      this.logMessage(chalk.magenta(`debug`), this.ensureString(message), context);
    }
  }

  private logMessage(prefix: string, message: string, context?: string) {
    process.stdout.write(
      [ prefix, this.logTimestamp(), this.logContext(context), message, '\n' ].join(' '),
    );
  }

  private logContext(context?: string) {
    return chalk.cyan(`[${context || this.defaultContext}]`);
  }

  private logTimestamp() {
    if (this.timestamp) {
      // const timestamp = new Date(Date.now()).toLocaleString(undefined, this.localeStringOptions);
      const timestamp = new Date(Date.now()).toLocaleString(undefined);
      return chalk.gray(timestamp + ' -');
    } else {
      return '';
    }
  }

  private ensureString(message: string | object | any[]): string {
    return typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  }

}
