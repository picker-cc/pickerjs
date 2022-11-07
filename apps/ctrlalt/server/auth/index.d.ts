import { AuthConfig } from "./types";
import { BaseListTypeInfo, SchemaConfig } from "@pickerjs/core";
export declare function createAuth<ListTypeInfo extends BaseListTypeInfo>({ listKey, secretField, initFirstItem, identityField, magicAuthLink, passwordResetLink, sessionData, }: AuthConfig<ListTypeInfo>): {
    withAuth: (schemaConfig: SchemaConfig) => SchemaConfig;
};
