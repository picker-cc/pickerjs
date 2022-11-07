import { PickerDbAPI } from "@picker-cc/core";
export declare function validateSecret(identityField: string, identity: string, secretField: string, secret: string, dbItemAPI: PickerDbAPI<any>[string]): Promise<{
    success: false;
} | {
    success: true;
    item: {
        id: any;
        [prop: string]: any;
    };
}>;
