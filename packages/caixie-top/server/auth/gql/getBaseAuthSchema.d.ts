import { AuthGqlNames } from '../types';
import { graphql } from "@picker-cc/core";
export declare function getBaseAuthSchema<I extends string, S extends string>({ listKey, identityField, secretField, gqlNames, base, }: {
    listKey: string;
    identityField: I;
    secretField: S;
    gqlNames: AuthGqlNames;
    base: graphql.BaseSchemaMeta;
}): any;
