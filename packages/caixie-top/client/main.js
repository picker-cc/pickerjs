"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const App_vue_1 = __importDefault(require("./App.vue"));
const vue_1 = require("../node_modules/vue");
const router_1 = require("./router");
const stores_1 = require("./stores");
function createApp() {
    const app = (0, vue_1.createSSRApp)(App_vue_1.default);
    const router = (0, router_1.createRouter)();
    const store = (0, stores_1.createPinia)();
    app.use(router);
    app.use(store);
    return { app, router, store };
}
exports.createApp = createApp;
//# sourceMappingURL=main.js.map