"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const core_1 = require("@pickerjs/core");
const utils_1 = require("./utils");
const scraper_service_1 = require("../server/scraper/scraper.service");
exports.Post = (0, core_1.list)({
    hooks: {
        beforeOperation({ operation, resolvedData, context }) {
            console.log('--d-d-d-d--d');
            context.injector.get(scraper_service_1.ScraperService).print();
        },
        resolveInput({ operation, resolvedData, context }) {
            console.log('x-x--x-x-');
            return resolvedData;
        }
    },
    ui: {},
    fields: {
        title: (0, core_1.text)({
            validation: {
                isRequired: true
            }
        }),
        slug: (0, core_1.text)({
            isIndexed: 'unique',
            validation: {
                isRequired: true
            }
        }),
        ...utils_1.trackingFields,
        status: (0, core_1.select)({
            type: 'enum',
            options: [
                { label: '草稿', value: 'draft' },
                { label: '已发布', value: 'published' }
            ]
        }),
        content: (0, core_1.text)({}),
        publishDate: (0, core_1.timestamp)(),
        user: (0, core_1.relationship)({
            ref: 'User.posts',
            hooks: {
                resolveInput({ operation, resolvedData, context }) {
                    if (operation === 'create' && !resolvedData.user && context.session?.itemId) {
                        return { connect: { id: context.session?.itemId } };
                    }
                    return resolvedData.user;
                },
            },
        })
    }
});
//# sourceMappingURL=Post.js.map
