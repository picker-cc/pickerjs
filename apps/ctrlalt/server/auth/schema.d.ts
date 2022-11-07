import { AuthGqlNames, InitFirstItemConfig } from './types';
import { ExtendGraphqlSchema } from "@pickerjs/core";
export declare const getSchemaExtension: ({ identityField, listKey, secretField, gqlNames, initFirstItem, sessionData, }: {
    identityField: string;
    listKey: string;
    secretField: string;
    gqlNames: AuthGqlNames;
    initFirstItem?: InitFirstItemConfig<any>;
    sessionData: string;
}) => ExtendGraphqlSchema;
