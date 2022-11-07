"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@pickerjs/core");
const picker_cc_1 = require("./picker-cc");
(0, core_1.bootstrapWorker)(picker_cc_1.pickerConfig)
    .then(worker => worker.startJobQueue())
    .catch(err => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=index-worker.js.map
