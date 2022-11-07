"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = void 0;
const main_1 = require("./main");
const server_renderer_1 = require("vue/server-renderer");
async function render(url) {
    const { app, router } = (0, main_1.createApp)();
    console.log(url);
    router.push(url);
    await router.isReady();
    const template = await (0, server_renderer_1.renderToString)(app);
    return { template };
}
exports.render = render;
//# sourceMappingURL=entry-server.js.map