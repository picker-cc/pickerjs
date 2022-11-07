"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const { app, router } = (0, main_1.createApp)();
router.isReady().then(() => {
    app.mount('#app');
});
//# sourceMappingURL=entry-client.js.map