import {BaseListTypeInfo, PickerContext} from "@picker-cc/core";

export type AuthGqlNames = {
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

export type SendVerifyCodeFn = (args: {
    itemId: string | number | bigint;
    identity: string;
    code: string;
    context: PickerContext;
}) => Promise<void> | void;

export type AuthTokenTypeConfig = {
    /** 当应该向用户发送他们请求的登录验证码时调用 */
    sendVerifyCode: SendVerifyCodeFn;
    /** 从发送时起，验证码的有效时间，单位为分钟 **/
    verifyCodeValidForMins?: number;
};

export type AuthConfig<ListTypeInfo extends BaseListTypeInfo> = {
    /** 用于对用户身份验证的列表的键 */
    listKey: ListTypeInfo['key'];
    /** 存储身份的唯一标识字段，必需是文本字段 */
    identityField: ListTypeInfo['fields'];
    /** 存储验证信息的字段，一般为*/
    /** must be password-ish 必需是密码形式的 */
    secretField: ListTypeInfo['fields'];
    /**初始的 user/db 种子功能 */
    initFirstItem?: InitFirstItemConfig<ListTypeInfo>;
    /** 密码重置链接功能 */
    passwordResetLink?: AuthTokenTypeConfig;
    /** "Magic link" 功能，比如点链接登录/重置密码 */
    magicAuthLink?: AuthTokenTypeConfig;
    /** 填充 session Data*/
    sessionData?: string;
};

export type InitFirstItemConfig<ListTypeInfo extends BaseListTypeInfo> = {
    /** 要收集的字段数组，例如：['name', 'email', 'password']*/
    fields: readonly ListTypeInfo['fields'][];
    /** 为 create mutation 添加额外的输入数据 */
    itemData?: Partial<ListTypeInfo['inputs']['create']>;
};

export type AuthTokenRedemptionErrorCode = 'FAILURE' | 'TOKEN_EXPIRED' | 'TOKEN_REDEEMED';

// export type SecretFieldImpl = {
//     generateHash: (secret: string) => Promise<string>;
//     compare: (secret: string, hash: string) => Promise<string>;
// };
