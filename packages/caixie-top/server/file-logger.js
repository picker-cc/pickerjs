"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleFileLogger = void 0;
const fs_1 = __importDefault(require("fs"));
class SimpleFileLogger {
    constructor(logfileLocation) {
        this.logfile = fs_1.default.createWriteStream(logfileLocation, { flags: 'w', encoding: 'utf8' });
    }
    error(message, context) {
        this.logfile.write(`${new Date().toISOString()} ERROR: [${context}] ${message}\n`, 'utf8');
    }
    warn(message, context) {
        this.logfile.write(`${new Date().toISOString()} WARN: [${context}] ${message}\n`, 'utf8');
    }
    info(message, context) {
        this.logfile.write(`${new Date().toISOString()} INFO: [${context}] ${message}\n`, 'utf8');
    }
    verbose(message, context) {
        this.logfile.write(`${new Date().toISOString()} VERBOSE: [${context}] ${message}\n`, 'utf8');
    }
    debug(message, context) {
        this.logfile.write(`${new Date().toISOString()} DEBUG: [${context}] ${message}\n`, 'utf8');
    }
}
exports.SimpleFileLogger = SimpleFileLogger;
//# sourceMappingURL=file-logger.js.map