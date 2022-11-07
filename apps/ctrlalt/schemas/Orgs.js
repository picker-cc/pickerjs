"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Apps = void 0;
const core_1 = require("@picker-cc/core");
exports.Apps = (0, core_1.list)({
    ui: {},
    fields: {
        domain: (0, core_1.text)({}),
        path: (0, core_1.text)({}),
        public: (0, core_1.text)({}),
        lang: (0, core_1.text)({}),
        type: (0, core_1.text)({}),
        subdomain: (0, core_1.text)({})
    }
});
//# sourceMappingURL=Orgs.js.map