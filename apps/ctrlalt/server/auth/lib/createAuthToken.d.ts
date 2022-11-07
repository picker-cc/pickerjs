import { PickerDbAPI } from "@pickerjs/core";
export declare function createAuthToken(identityField: string, identity: string, dbItemAPI: PickerDbAPI<any>[string]): Promise<{
    success: false;
} | {
    success: true;
    itemId: string | number | bigint;
    token: string;
}>;
