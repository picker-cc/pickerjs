"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultAvailableLanguages = exports.defaultLocale = exports.defaultLanguage = exports.loggerCtx = exports.DEFAULT_APP_PATH = void 0;
const path_1 = __importDefault(require("path"));
exports.DEFAULT_APP_PATH = path_1.default.join(__dirname, '../admin-ui');
exports.loggerCtx = 'AdminUiPlugin';
exports.defaultLanguage = 'zh_Hans';
exports.defaultLocale = undefined;
exports.defaultAvailableLanguages = [];
//# sourceMappingURL=constants.js.map