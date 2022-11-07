import { BaseListTypeInfo, PickerContext } from "@pickerjs/core";
export declare type AuthGqlNames = {
    CreateInitialInput: string;
    createInitialItem: string;
    authenticateItemWithVerifyCode: string;
    ItemAuthenticationWithVerifyCodeResult: string;
    ItemAuthenticationWithVerifyCodeSuccess: string;
    ItemAuthenticationWithVerifyCodeFailure: string;
    sendItemVerifyCode: string;
    ItemSendVerifyCodeResult: string;
    ItemSendVerifyCodeSuccess: string;
    ItemSendVerifyCodeFailure: string;
};
export declare type SendVerifyCodeFn = (args: {
    itemId: string | number | bigint;
    identity: string;
    code: string;
    context: PickerContext;
}) => Promise<void> | void;
export declare type AuthTokenTypeConfig = {
    sendVerifyCode: SendVerifyCodeFn;
    verifyCodeValidForMins?: number;
};
export declare type AuthConfig<ListTypeInfo extends BaseListTypeInfo> = {
    listKey: ListTypeInfo['key'];
    identityField: ListTypeInfo['fields'];
    secretField: ListTypeInfo['fields'];
    initFirstItem?: InitFirstItemConfig<ListTypeInfo>;
    passwordResetLink?: AuthTokenTypeConfig;
    magicAuthLink?: AuthTokenTypeConfig;
    sessionData?: string;
};
export declare type InitFirstItemConfig<ListTypeInfo extends BaseListTypeInfo> = {
    fields: readonly ListTypeInfo['fields'][];
    itemData?: Partial<ListTypeInfo['inputs']['create']>;
};
export declare type AuthTokenRedemptionErrorCode = 'FAILURE' | 'TOKEN_EXPIRED' | 'TOKEN_REDEEMED';
