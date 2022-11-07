/**
 * 测试实体 id 策略，所有 id 前缀为常量字符串。这是用在 e2e 测试以确保参数中的所有 ID 属性的正确解码。
 */
import {EntityIdStrategy} from "@picker-cc/core";

export class TestingEntityIdStrategy implements EntityIdStrategy<'increment'> {
    readonly primaryKeyType = 'increment';
    decodeId(id: string): number {
        const asNumber = parseInt(id.replace('T_', ''), 10);
        return Number.isNaN(asNumber) ? -1 : asNumber;
    }
    encodeId(primaryKey: number): string {
        return 'T_' + primaryKey.toString();
    }
}
