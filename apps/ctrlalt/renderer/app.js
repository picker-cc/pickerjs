"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const vue_1 = require("../node_modules/vue");
const PageShell_vue_1 = __importDefault(require("./PageShell.vue"));
const usePageContext_1 = require("./usePageContext");
function createApp(pageContext) {
    const { Page, pageProps } = pageContext;
    const PageWithLayout = (0, vue_1.defineComponent)({
        render() {
            return (0, vue_1.h)(PageShell_vue_1.default, {}, {
                default() {
                    return (0, vue_1.h)(Page, pageProps || {});
                }
            });
        }
    });
    const app = (0, vue_1.createSSRApp)(PageWithLayout);
    (0, usePageContext_1.setPageContext)(app, pageContext);
    return app;
}
exports.createApp = createApp;
//# sourceMappingURL=app.js.map