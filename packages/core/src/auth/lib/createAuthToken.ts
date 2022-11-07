import {randomBytes} from 'crypto';
import {PickerDbAPI} from "../../schema/types";

function generateToken(length: number): string {
    return randomBytes(length) // Generates N*8 bits of data
        .toString('base64') // Groups by 6-bits and encodes as ascii chars in [A-Za-z0-9+/] and '=' for padding (~8/6 * N chars)
        .replace(/[^a-zA-Z0-9]/g, '') // Removes any '+', '/' (62, 63) and '=' chars as often require escaping (eg. in urls)
        .slice(0, length); // Shortens the string, so we now have ~6*N bits of data (it's actually log2(62)*N = 5.954*N)
}

// TODO:由于定时攻击，认证令牌突变可能泄露用户身份:(
//(目前)不做任何努力来减少记录新令牌或成功时发送电子邮件所花费的时间
export async function createAuthToken(
    identityField: string,
    identity: string,
    dbItemAPI: PickerDbAPI<any>[string]
): Promise<{ success: false } | { success: true; itemId: string | number | bigint; token: string }> {
    const item = await dbItemAPI.findOne({where: {[identityField]: identity}});
    if (item) {
        return {success: true, itemId: item.id, token: generateToken(20)};
    } else {
        return {success: false};
    }
}
