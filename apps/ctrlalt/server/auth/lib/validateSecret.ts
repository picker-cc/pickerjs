import {PickerDbAPI} from "@picker-cc/core";

export async function validateSecret(
    identityField: string,
    identity: string,
    secretField: string,
    secret: string,
    dbItemAPI: PickerDbAPI<any>[string]
): Promise<{ success: false } | { success: true; item: { id: any; [prop: string]: any } }> {
    const item = await dbItemAPI.findOne({where: {[identityField]: identity}});

    if (!item || !item[secretField]) {
        //请参阅README中的“身份保护”，以了解为什么这是一个东西
        // await secretFieldImpl.generateHash('simulated-password-to-counter-timing-attack');
        return {success: false};
    // } else if (await secretFieldImpl.compare(secret, item[secretField])) {
        // Authenticated!
        // return {success: true, item};
    } else {
        return {success: false};
    }
}
