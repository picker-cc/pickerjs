import { GraphQLSchema } from 'graphql';
import { AuthGqlNames, InitFirstItemConfig } from '../types';
import { BaseItem, graphql } from "@pickerjs/core";
export declare function getInitFirstItemSchema({ listKey, fields, itemData, gqlNames, graphQLSchema, ItemAuthenticationWithPasswordSuccess, }: {
    listKey: string;
    fields: InitFirstItemConfig<any>['fields'];
    itemData: InitFirstItemConfig<any>['itemData'];
    gqlNames: AuthGqlNames;
    graphQLSchema: GraphQLSchema;
    ItemAuthenticationWithPasswordSuccess: graphql.ObjectType<{
        item: BaseItem;
        sessionToken: string;
    }>;
}): any;
