"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInitFirstItemSchema = void 0;
const graphql_1 = require("graphql");
const core_1 = require("@pickerjs/core");
function getInitFirstItemSchema({ listKey, fields, itemData, gqlNames, graphQLSchema, ItemAuthenticationWithPasswordSuccess, }) {
    const createInputConfig = (0, graphql_1.assertInputObjectType)(graphQLSchema.getType(`${listKey}CreateInput`)).toConfig();
    const fieldsSet = new Set(fields);
    const initialCreateInput = core_1.graphql.wrap.inputObject(new graphql_1.GraphQLInputObjectType({
        ...createInputConfig,
        fields: Object.fromEntries(Object.entries(createInputConfig.fields).filter(([fieldKey]) => fieldsSet.has(fieldKey))),
        name: gqlNames.CreateInitialInput,
    }));
    return {
        mutation: {
            [gqlNames.createInitialItem]: core_1.graphql.field({
                type: core_1.graphql.nonNull(ItemAuthenticationWithPasswordSuccess),
                args: { data: core_1.graphql.arg({ type: core_1.graphql.nonNull(initialCreateInput) }) },
                async resolve(rootVal, { data }, context) {
                    if (!context.startSession) {
                        throw new Error('No session implementation available on context');
                    }
                    const dbItemAPI = context.sudo().db[listKey];
                    const count = await dbItemAPI.count({});
                    if (count !== 0) {
                        throw new Error('只有当该列表中不存在任何项时，才可以创建初始项');
                    }
                    const item = await dbItemAPI.createOne({ data: { ...data, ...itemData } });
                    const sessionToken = await context.startSession({ listKey, itemId: item.id.toString() });
                    return { item, sessionToken };
                },
            }),
        },
    };
}
exports.getInitFirstItemSchema = getInitFirstItemSchema;
//# sourceMappingURL=getInitFirstItemSchema.js.map
