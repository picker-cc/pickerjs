"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaExtension = void 0;
const getBaseAuthSchema_1 = require("./gql/getBaseAuthSchema");
const getInitFirstItemSchema_1 = require("./gql/getInitFirstItemSchema");
const graphql_1 = require("graphql");
const core_1 = require("@picker-cc/core");
const getSchemaExtension = ({ identityField, listKey, secretField, gqlNames, initFirstItem, sessionData, }) => core_1.graphql.extend(base => {
    const uniqueWhereInputType = (0, graphql_1.assertInputObjectType)(base.schema.getType(`${listKey}WhereUniqueInput`));
    const identityFieldOnUniqueWhere = uniqueWhereInputType.getFields()[identityField];
    if (identityFieldOnUniqueWhere?.type !== graphql_1.GraphQLString &&
        identityFieldOnUniqueWhere?.type !== graphql_1.GraphQLID) {
        throw new Error(`在列表 ${listKey} 中使用 identifyField 为 ${identityField} 调用 createAuth` +
            `但该字符不允许使用 String 或 ID 进行唯一搜索。你应该添加 \`isIndexed: 'unique'\` 给 ${listKey}.${identityField}`);
    }
    const baseSchema = (0, getBaseAuthSchema_1.getBaseAuthSchema)({
        identityField,
        listKey,
        secretField,
        gqlNames,
        base,
    });
    let ast;
    let query = `query($id: ID!) { ${(0, core_1.getGqlNames)({
        listKey,
        pluralGraphQLName: '',
    }).itemQueryName}(where: { id: $id }) { ${sessionData} } }`;
    try {
        ast = (0, graphql_1.parse)(query);
    }
    catch (err) {
        throw new Error(`获取会话数据的查询有语法错误，createAuth中的 sessionData 选项可能不正确\n${err}`);
    }
    const errors = (0, graphql_1.validate)(base.schema, ast);
    if (errors.length) {
        throw new Error(`获取会话数据的查询有验证错误，您的 createAuth 中的 sessionData 选项可能是不正确有的 \n${errors.join('\n')}`);
    }
    return [
        baseSchema.extension,
        initFirstItem &&
            (0, getInitFirstItemSchema_1.getInitFirstItemSchema)({
                listKey,
                fields: initFirstItem.fields,
                itemData: initFirstItem.itemData,
                gqlNames,
                graphQLSchema: base.schema,
                ItemAuthenticationWithPasswordSuccess: baseSchema.ItemAuthenticationWithPasswordSuccess,
            }),
    ].filter((x) => x !== undefined);
});
exports.getSchemaExtension = getSchemaExtension;
//# sourceMappingURL=schema.js.map