"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRouter = void 0;
const vue_router_1 = require("../../node_modules/vue-router");
const pages = import.meta.glob('../pages/*.vue');
console.log(pages);
const routes = Object.keys(pages).map((path) => {
    const name = path.match(/\.\.\/pages\/(.*)\.vue$/)[1].toLowerCase();
    console.log(name);
    console.log(pages[path]);
    const routePath = `/${name}`;
    if (routePath === '/admin') {
        return {
            path: '/admin',
            name,
            component: pages[path],
        };
    }
    return {
        path: routePath,
        name,
        component: pages[path],
    };
});
function createRouter() {
    return (0, vue_router_1.createRouter)({
        history: import.meta.env.SSR ? (0, vue_router_1.createMemoryHistory)() : (0, vue_router_1.createWebHistory)(),
        routes,
    });
}
exports.createRouter = createRouter;
//# sourceMappingURL=index.js.map