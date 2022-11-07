import { LoggerService } from '@nestjs/common';

/**
 * @description
 * An enum of valid logging levels.
 *
 * @docsCategory Logger
 */
export enum LogLevel {
    /**
     * @description
     * Log Errors only.
     */
    Error = 0,
    Warn = 1,
    Info = 2,
    Verbose = 3,
    Debug = 4,
}

/**
 * @description
 * The PickerLogger interface defines the shape of a logger service which may be provided in
 * the config.
 *
 * @docsCategory Logger
 */
export interface PickerLogger {
    error(message: string, context?: string, trace?: string): void;
    warn(message: string, context?: string): void;
    info(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    debug(message: string, context?: string): void;
}

const noopLogger: PickerLogger = {
    error() { /* */ },
    warn() { /* */ },
    info() { /* */ },
    verbose() { /* */ },
    debug() { /* */ },
};

/**
 * @description
 * The Logger is responsible for all logging in a Vendure application.
 *
 * It is intended to be used as a static class:
 *
 * @example
 * ```ts
 * import { Logger } from '\@vendure/core';
 *
 * Logger.info(`Some log message`, 'My Vendure Plugin');
 * ```
 *
 * The actual implementation - where the logs are written to - is defined by the {@link PickerLogger}
 * instance configured in the {@link VendureConfig}. By default, the {@link DefaultLogger} is used, which
 * logs to the console.
 *
 * ## Implementing a custom logger
 *
 * A custom logger can be passed to the `logger` config option by creating a class which implements the
 * {@link PickerLogger} interface. For example, here is how you might go about implementing a logger which
 * logs to a file:
 *
 * @example
 * ```ts
 * import { PickerLogger } from '\@vendure/core';
 * import fs from 'fs';
 *
 * // A simple custom logger which writes all logs to a file.
 * export class SimpleFileLogger implements PickerLogger {
 *     private logfile: fs.WriteStream;
 *
 *     constructor(logfileLocation: string) {
 *         this.logfile = fs.createWriteStream(logfileLocation, { flags: 'w' });
 *     }
 *
 *     error(message: string, context?: string) {
 *         this.logfile.write(`ERROR: [${context}] ${message}\n`);
 *     }
 *     warn(message: string, context?: string) {
 *         this.logfile.write(`WARN: [${context}] ${message}\n`);
 *     }
 *     info(message: string, context?: string) {
 *         this.logfile.write(`INFO: [${context}] ${message}\n`);
 *     }
 *     verbose(message: string, context?: string) {
 *         this.logfile.write(`VERBOSE: [${context}] ${message}\n`);
 *     }
 *     debug(message: string, context?: string) {
 *         this.logfile.write(`DEBUG: [${context}] ${message}\n`);
 *     }
 * }
 *
 * // in the VendureConfig
 * export const config = {
 *     // ...
 *     logger: new SimpleFileLogger('server.log'),
 * }
 * ```
 *
 * @docsCategory Logger
 */
export class Logger implements LoggerService {
    private static _instance: typeof Logger = Logger;
    private static _logger: PickerLogger;

    static get logger(): PickerLogger {
        return this._logger || noopLogger;
    }

    private get instance(): typeof Logger {
        const { _instance } = Logger;
        return _instance;
    }

    /** @internal */
    static useLogger(logger: PickerLogger) {
        Logger._logger = logger;
    }

    /** @internal */
    error(message: any, trace?: string, context?: string): any {
        this.instance.error(message, context, trace);
    }

    /** @internal */
    warn(message: any, context?: string): any {
        this.instance.warn(message, context);
    }

    /** @internal */
    log(message: any, context?: string): any {
        this.instance.info(message, context);
    }

    /** @internal */
    verbose(message: any, context?: string): any {
        this.instance.verbose(message, context);
    }

    /** @internal */
    debug(message: any, context?: string): any {
        this.instance.debug(message, context);
    }

    static error(message: string, context?: string, trace?: string): void {
        Logger.logger.error(message, context, trace);
    }

    static warn(message: string, context?: string): void {
        Logger.logger.warn(message, context);
    }

    static info(message: string, context?: string): void {
        Logger.logger.info(message, context);
    }

    static verbose(message: string, context?: string): void {
        Logger.logger.verbose(message, context);
    }

    static debug(message: string, context?: string): void {
        Logger.logger.debug(message, context);
    }
}
