import {assertInputObjectType, GraphQLInputObjectType, GraphQLSchema} from 'graphql';

import {AuthGqlNames, InitFirstItemConfig} from '../types';
import {BaseItem, graphql, PickerContext} from "@picker-cc/core";
export function getInitFirstItemSchema({
                                           listKey,
                                           fields,
                                           itemData,
                                           gqlNames,
                                           graphQLSchema,
                                           ItemAuthenticationWithPasswordSuccess,
                                       }: {
    listKey: string;
    fields: InitFirstItemConfig<any>['fields'];
    itemData: InitFirstItemConfig<any>['itemData'];
    gqlNames: AuthGqlNames;
    graphQLSchema: GraphQLSchema;
    ItemAuthenticationWithPasswordSuccess: graphql.ObjectType<{
        item: BaseItem;
        sessionToken: string;
    }>;
}): any {
    const createInputConfig = assertInputObjectType(
        graphQLSchema.getType(`${listKey}CreateInput`)
    ).toConfig();
    const fieldsSet = new Set(fields);
    const initialCreateInput = graphql.wrap.inputObject(
        new GraphQLInputObjectType({
            ...createInputConfig,
            fields: Object.fromEntries(
                Object.entries(createInputConfig.fields).filter(([fieldKey]) => fieldsSet.has(fieldKey))
            ),
            name: gqlNames.CreateInitialInput,
        })
    );
    // @ts-ignore
    return {
        mutation: {
            [gqlNames.createInitialItem]: graphql.field({
                // @ts-ignore
                type: graphql.nonNull(ItemAuthenticationWithPasswordSuccess),
                args: {data: graphql.arg({type: graphql.nonNull(initialCreateInput)})},
                // @ts-ignore
                async resolve(rootVal, {data}, context: PickerContext): Promise<{item: any, sessionToken: any}> {
                    if (!context.startSession) {
                        throw new Error('No session implementation available on context');
                    }

                    const dbItemAPI = context.sudo().db[listKey];
                    const count = await dbItemAPI.count({});
                    if (count !== 0) {
                        throw new Error('只有当该列表中不存在任何项时，才可以创建初始项')
                        // throw new Error('Initial items can only be created when no items exist in that list');
                    }

                    //更新系统状态这严格来说是不正确的。
                    // db API会对一个已经被强制的值进行GraphQL强制(这也很好，人们使用输入值不能往返的东西的几率非常低，比如这里的Upload标量)

                    const item = await dbItemAPI.createOne({data: {...data, ...itemData}});

                    const sessionToken = await context.startSession({listKey, itemId: item.id.toString()});
                    return {item, sessionToken};
                },
            }),
        },
    };
}
