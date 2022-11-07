import { AuthTokenRedemptionErrorCode } from '../types';
import { PickerDbAPI } from "@picker-cc/core";
export declare function validateAuthToken(listKey: string, tokenType: 'passwordReset' | 'magicAuth', identityField: string, identity: string, tokenValidMins: number | undefined, token: string, dbItemAPI: PickerDbAPI<any>[string]): Promise<{
    success: false;
    code: AuthTokenRedemptionErrorCode;
} | {
    success: true;
    item: {
        id: any;
        [prop: string]: any;
    };
}>;
