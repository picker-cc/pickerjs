"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPageContext = exports.usePageContext = void 0;
const vue_1 = require("../node_modules/vue");
const key = Symbol();
function usePageContext() {
    const pageContext = (0, vue_1.inject)(key);
    if (!pageContext)
        throw new Error('setPageContext() not called in parent');
    return pageContext;
}
exports.usePageContext = usePageContext;
function setPageContext(app, pageContext) {
    app.provide(key, pageContext);
}
exports.setPageContext = setPageContext;
//# sourceMappingURL=usePageContext.js.map