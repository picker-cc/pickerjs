"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_vue_1 = __importDefault(require("@vitejs/plugin-vue"));
const plugin_1 = __importDefault(require("vite-plugin-ssr/plugin"));
const vite_1 = __importDefault(require("unocss/vite"));
const config = {
    base: '/admin',
    resolve: {
        alias: {
            '#root': __dirname
        }
    },
    plugins: [
        (0, plugin_vue_1.default)(),
        (0, plugin_1.default)({
            includeAssetsImportedByServer: true,
        }),
        (0, vite_1.default)(),
    ]
};
exports.default = config;
//# sourceMappingURL=vite.config.js.map