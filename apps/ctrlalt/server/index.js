"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@picker-cc/core");
const picker_cc_1 = require("./picker-cc");
(0, core_1.bootstrap)(picker_cc_1.pickerConfig)
    .then(app => {
})
    .catch(err => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map