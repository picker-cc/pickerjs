"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackingFields = exports.dbConfig = void 0;
const core_1 = require("@picker-cc/core");
exports.dbConfig = {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
};
exports.trackingFields = {
    createdAt: (0, core_1.timestamp)({
        access: { read: () => true, create: () => false, update: () => false },
        validation: { isRequired: true },
        defaultValue: { kind: 'now' },
        ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
        },
    }),
    updatedAt: (0, core_1.timestamp)({
        access: { read: () => true, create: () => false, update: () => false },
        db: { updatedAt: true },
        validation: { isRequired: true },
        ui: {
            createView: { fieldMode: 'hidden' },
            itemView: { fieldMode: 'read' },
        },
    }),
};
//# sourceMappingURL=utils.js.map