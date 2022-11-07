import { IncomingMessage, ServerResponse } from 'http';
import type { GraphQLResolveInfo } from 'graphql';
import type { GqlNames } from './utils';
import {PickerContext, SessionContext} from "./picker-context";
import {BasePickerTypeInfo} from "./type-info";
import {EventBus} from "../../event-bus";
import {Injector} from "../../common";

export type DatabaseProvider = 'sqlite' | 'postgresql' | 'mysql';

export type CreateRequestContext<TypeInfo extends BasePickerTypeInfo> = (
    req: IncomingMessage,
    res: ServerResponse
) => Promise<PickerContext<TypeInfo>>;

export type CreateContext = (args: {
    eventBus?: EventBus
    injector?: Injector,
    sessionContext?: SessionContext<any>;
    sudo?: boolean;
    req?: IncomingMessage;
}) => PickerContext;

// export type SessionImplementation = {
//     createSessionContext(
//         req: IncomingMessage,
//         res: ServerResponse,
//         createContext: CreateContext
//     ): Promise<SessionContext<any>>;
// };

export type GraphQLResolver<Context extends PickerContext> = (
    root: any,
    args: any,
    context: Context,
    info: GraphQLResolveInfo
) => any;

export type GraphQLSchemaExtension<Context extends PickerContext> = {
    typeDefs: string;
    resolvers: Record<string, Record<string, GraphQLResolver<Context>>>;
};

// TODO: don't duplicate this between here and packages/core/ListTypes/list.js
export function getGqlNames({
                                listKey,
                                pluralGraphQLName,
                            }: {
    listKey: string;
    pluralGraphQLName: string;
}): GqlNames {
    const lowerPluralName = pluralGraphQLName.slice(0, 1).toLowerCase() + pluralGraphQLName.slice(1);
    const lowerSingularName = listKey.slice(0, 1).toLowerCase() + listKey.slice(1);
    return {
        outputTypeName: listKey,
        itemQueryName: lowerSingularName,
        listQueryName: lowerPluralName,
        listQueryCountName: `${lowerPluralName}Count`,
        listOrderName: `${listKey}OrderByInput`,
        deleteMutationName: `delete${listKey}`,
        updateMutationName: `update${listKey}`,
        createMutationName: `create${listKey}`,
        deleteManyMutationName: `delete${pluralGraphQLName}`,
        updateManyMutationName: `update${pluralGraphQLName}`,
        createManyMutationName: `create${pluralGraphQLName}`,
        whereInputName: `${listKey}WhereInput`,
        whereUniqueInputName: `${listKey}WhereUniqueInput`,
        updateInputName: `${listKey}UpdateInput`,
        createInputName: `${listKey}CreateInput`,
        updateManyInputName: `${listKey}UpdateArgs`,
        relateToManyForCreateInputName: `${listKey}RelateToManyForCreateInput`,
        relateToManyForUpdateInputName: `${listKey}RelateToManyForUpdateInput`,
        relateToOneForCreateInputName: `${listKey}RelateToOneForCreateInput`,
        relateToOneForUpdateInputName: `${listKey}RelateToOneForUpdateInput`,
    };
}
