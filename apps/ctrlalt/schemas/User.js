"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const core_1 = require("@pickerjs/core");
const utils_1 = require("./utils");
exports.User = (0, core_1.list)({
    access: {
        operation: {
            create: ({ session }) => {
                return session?.data.isAdmin;
            },
            delete: ({ session }) => {
                return session?.data.isAdmin;
            },
        }
    },
    hooks: {
        beforeOperation({ operation, resolvedData, context }) {
        },
        resolveInput({ operation, resolvedData, context }) {
            return resolvedData;
        }
    },
    ui: {},
    fields: {
        name: (0, core_1.text)({}),
        identifier: (0, core_1.text)({
            isIndexed: 'unique',
            validation: {
                isRequired: true
            }
        }),
        detail: (0, core_1.text)(),
        avatar: (0, core_1.text)(),
        deletedAt: (0, core_1.timestamp)({
            defaultValue: { kind: 'now' }
        }),
        ...utils_1.trackingFields,
        verified: (0, core_1.checkbox)({}),
        enabled: (0, core_1.checkbox)({}),
        lastLogin: (0, core_1.timestamp)({
            defaultValue: { kind: 'now' }
        }),
        verifyCode: (0, core_1.text)(),
        verifyCodeCreatedAt: (0, core_1.timestamp)(),
        password: (0, core_1.password)({
            access: {
                update: ({ session, item }) => {
                    return session && (session.data.isAdmin || session.itemId === item.id);
                }
            }
        }),
        isAdmin: (0, core_1.checkbox)({
            access: {
                create: ({ session }) => session?.data.isAdmin,
                update: ({ session }) => session?.data.isAdmin,
            }
        }),
        print: (0, core_1.text)(),
        posts: (0, core_1.relationship)({ ref: 'Post.user', many: true })
    }
});
//# sourceMappingURL=User.js.map
