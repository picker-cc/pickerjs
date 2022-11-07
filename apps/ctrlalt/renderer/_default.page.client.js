"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const app_1 = require("./app");
const anu_vue_1 = require("../node_modules/anu-vue");
require("uno.css");
require("anu-vue/dist/style.css");
async function render(pageContext) {
    const app = (0, app_1.createApp)(pageContext);
    app.use(anu_vue_1.anu);
    app.mount('#app');
}
exports.render = render;
//# sourceMappingURL=_default.page.client.js.map