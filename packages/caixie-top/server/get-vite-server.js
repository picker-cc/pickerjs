"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViteServer = void 0;
const vite_1 = require("vite");
const resolve_path_1 = require("./utils/resolve-path");
let viteDevServer;
const root = `${__dirname}/..`;
async function getViteServer({ force } = { force: false }) {
    if (!viteDevServer || force) {
        viteDevServer = await (0, vite_1.createServer)({
            publicDir: (0, resolve_path_1.resolveClientPath)('public'),
            root,
            logLevel: 'info',
            server: {
                middlewareMode: 'ssr',
            },
        });
    }
    return viteDevServer;
}
exports.getViteServer = getViteServer;
//# sourceMappingURL=get-vite-server.js.map