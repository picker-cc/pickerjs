import { fail } from 'assert';

/**
 * Helper 方法，用于创建在尝试操作时 assert 给定错误消息的测试。
 */
export function assertThrowsWithMessage(operation: () => Promise<any>, message: string | (() => string)) {
    return async () => {
        try {
            await operation();
            fail('Should have thrown');
        } catch (err) {
            const messageString = typeof message === 'function' ? message() : message;
            // @ts-ignore
            expect(err.message).toEqual(expect.stringContaining(messageString));
        }
    };
}
