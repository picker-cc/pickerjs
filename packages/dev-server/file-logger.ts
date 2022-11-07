import { PickerLogger } from '@picker-cc/core';
import fs from 'fs';

// 一个简单的自定义日志记录器，它将所有日志写入到一个文件中。
export class SimpleFileLogger implements PickerLogger {
    private logfile: fs.WriteStream;

    constructor(logfileLocation: string) {
        this.logfile = fs.createWriteStream(logfileLocation, { flags: 'w', encoding: 'utf8' });
    }

    error(message: string, context?: string) {
        this.logfile.write(`${new Date().toISOString()} ERROR: [${context}] ${message}\n`, 'utf8');
    }
    warn(message: string, context?: string) {
        this.logfile.write(`${new Date().toISOString()} WARN: [${context}] ${message}\n`, 'utf8');
    }
    info(message: string, context?: string) {
        this.logfile.write(`${new Date().toISOString()} INFO: [${context}] ${message}\n`, 'utf8');
    }
    verbose(message: string, context?: string) {
        this.logfile.write(`${new Date().toISOString()} VERBOSE: [${context}] ${message}\n`, 'utf8');
    }
    debug(message: string, context?: string) {
        this.logfile.write(`${new Date().toISOString()} DEBUG: [${context}] ${message}\n`, 'utf8');
    }
}
