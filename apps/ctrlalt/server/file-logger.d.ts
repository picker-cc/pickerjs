import { PickerLogger } from '@pickerjs/core';
export declare class SimpleFileLogger implements PickerLogger {
    private logfile;
    constructor(logfileLocation: string);
    error(message: string, context?: string): void;
    warn(message: string, context?: string): void;
    info(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    debug(message: string, context?: string): void;
}
