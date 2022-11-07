"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passToClient = exports.onBeforeRender = exports.render = void 0;
const server_renderer_1 = require("@vue/server-renderer");
const vite_plugin_ssr_1 = require("../node_modules/vite-plugin-ssr");
const app_1 = require("./app");
const logo_svg_1 = __importDefault(require("./logo.svg"));
const vue3_ssr_1 = require("@css-render/vue3-ssr");
exports.passToClient = ['pageProps', 'urlPathname'];
async function render(pageContext) {
    const app = (0, app_1.createApp)(pageContext);
    const { collect } = (0, vue3_ssr_1.setup)(app);
    const appHtml = await (0, server_renderer_1.renderToString)(app);
    const cssHtml = collect();
    const { documentProps } = pageContext.exports;
    const title = (documentProps && documentProps.title) || 'Vite SSR app';
    const desc = (documentProps && documentProps.description) || 'App using Vite + vite-plugin-ssr';
    const documentHtml = (0, vite_plugin_ssr_1.escapeInject) `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logo_svg_1.default}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
        ${(0, vite_plugin_ssr_1.dangerouslySkipEscape)(cssHtml)}
      </head>
      <body>
        <div id="app">${(0, vite_plugin_ssr_1.dangerouslySkipEscape)(appHtml)}</div>
      </body>

    </html>`;
    return {
        documentHtml,
        pageContext: {}
    };
}
exports.render = render;
async function onBeforeRender(pageContext) {
}
exports.onBeforeRender = onBeforeRender;
//# sourceMappingURL=_default.page.server.js.map