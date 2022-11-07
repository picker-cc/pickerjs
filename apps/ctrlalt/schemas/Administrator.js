"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Administrator = void 0;
const utils_1 = require("./utils");
const core_1 = require("@pickerjs/core");
exports.Administrator = (0, core_1.list)({
    fields: {
        name: (0, core_1.text)({
            validation: {
                isRequired: true
            },
        }),
        emailAddress: (0, core_1.text)({
            isIndexed: 'unique',
            validation: {
                isRequired: true
            }
        }),
        deletedAt: (0, core_1.timestamp)({
            defaultValue: { kind: 'now' }
        }),
        ...utils_1.trackingFields,
        user: (0, core_1.relationship)({
            ref: 'User.administrator'
        })
    }
});
//# sourceMappingURL=Administrator.js.map
