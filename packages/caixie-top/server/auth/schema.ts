import { AuthGqlNames, AuthTokenTypeConfig, InitFirstItemConfig} from './types';
import { getBaseAuthSchema } from './gql/getBaseAuthSchema';
import { getInitFirstItemSchema } from './gql/getInitFirstItemSchema';
import {
    assertInputObjectType,
    assertObjectType,
    GraphQLID,
    GraphQLSchema,
    GraphQLString,
    parse,
    validate
} from "graphql";
import {ExtendGraphqlSchema, getGqlNames, graphql} from "@picker-cc/core";


export const getSchemaExtension = ({
                                       identityField,
                                       listKey,
                                       secretField,
                                       gqlNames,
                                       initFirstItem,
                                       sessionData,
                                   }: {
    identityField: string;
    listKey: string;
    secretField: string;
    gqlNames: AuthGqlNames;
    initFirstItem?: InitFirstItemConfig<any>;
    sessionData: string;
}): ExtendGraphqlSchema =>
    graphql.extend(base => {
        const uniqueWhereInputType = assertInputObjectType(
            base.schema.getType(`${listKey}WhereUniqueInput`)
        );
        const identityFieldOnUniqueWhere = uniqueWhereInputType.getFields()[identityField];
        if (
            identityFieldOnUniqueWhere?.type !== GraphQLString &&
            identityFieldOnUniqueWhere?.type !== GraphQLID
        ) {
            throw new Error(
                `在列表 ${listKey} 中使用 identifyField 为 ${identityField} 调用 createAuth` +
                `但该字符不允许使用 String 或 ID 进行唯一搜索。你应该添加 \`isIndexed: 'unique'\` 给 ${listKey}.${identityField}`
            );
        }
        const baseSchema = getBaseAuthSchema({
            identityField,
            listKey,
            secretField,
            gqlNames,
            base,
        });

        // technically this will incorrectly error if someone has a schema extension that adds a field to the list output type
        // and then wants to fetch that field with `sessionData` but it's extremely unlikely someone will do that since if
        // they want to add a GraphQL field, they'll probably use a virtual field
        //从技术上讲，如果有人有一个模式扩展，添加一个字段到列表输出类型，
        // 然后想要用 `sessionData` 获取该字段，这将错误地出错，
        // 但这是非常不可能的，因为如果他们想要添加一个GraphQL字段，
        // 他们可能会使用一个虚拟字段
        let ast;
        let query = `query($id: ID!) { ${
            getGqlNames({
                listKey,
                //这不是用来获取itemQueryName的，我们在这里不知道它
                pluralGraphQLName: '',
            }).itemQueryName
        }(where: { id: $id }) { ${sessionData} } }`;
        try {
            ast = parse(query);
        } catch (err) {
            throw new Error(
                `获取会话数据的查询有语法错误，createAuth中的 sessionData 选项可能不正确\n${err}`
            );
        }

        const errors = validate(base.schema, ast);
        if (errors.length) {
            throw new Error(
                `获取会话数据的查询有验证错误，您的 createAuth 中的 sessionData 选项可能是不正确有的 \n${errors.join('\n')}`
            );
        }

        return [
            baseSchema.extension,
            initFirstItem &&
            getInitFirstItemSchema({
                listKey,
                fields: initFirstItem.fields,
                itemData: initFirstItem.itemData,
                gqlNames,
                graphQLSchema: base.schema,
                ItemAuthenticationWithPasswordSuccess: baseSchema.ItemAuthenticationWithPasswordSuccess,
            }),
        ].filter((x): x is Exclude<typeof x, undefined> => x !== undefined);
    });
