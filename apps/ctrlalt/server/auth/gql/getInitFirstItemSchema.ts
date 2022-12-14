import {assertInputObjectType, GraphQLInputObjectType, GraphQLSchema} from 'graphql';

import {AuthGqlNames, InitFirstItemConfig} from '../types';
import {BaseItem, graphql, PickerContext} from "@pickerjs/core";
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
                        throw new Error('?????????????????????????????????????????????????????????????????????')
                        // throw new Error('Initial items can only be created when no items exist in that list');
                    }

                    //???????????????????????????????????????????????????
                    // db API???????????????????????????????????????GraphQL??????(?????????????????????????????????????????????????????????????????????????????????????????????Upload??????)

                    const item = await dbItemAPI.createOne({data: {...data, ...itemData}});

                    const sessionToken = await context.startSession({listKey, itemId: item.id.toString()});
                    return {item, sessionToken};
                },
            }),
        },
    };
}
