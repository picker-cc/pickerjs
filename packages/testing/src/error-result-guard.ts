import { fail } from 'assert';

/**
 * @description
 * 创建一个 {@link ErrorResultGuard} 的快捷方法。接受一个函数用来测试输入是否被认为成功(true) 还是错误结果(false)。
 * 注意：为了在 TypeScript 中使用，生成的变量必需 _still_ 带类型注释，类型推断按照预期工作：
 *
 * @example
 * ```TypeScript
 * const orderResultGuard: ErrorResultGuard<AddItemToOrderResult>
 *   = createErrorResultGuard(order => !!order.lines);
 * ```
 * @docsCategory testing
 */
export function createErrorResultGuard<T>(testFn: (input: T) => boolean): ErrorResultGuard<T> {
    return new ErrorResultGuard<T>(testFn);
}

/**
 * @description
 * 一个用于断言操作成功的实用程序类
 * 返回一个联合类型 `SuccressType | ErrorResponse [ | ErrorResponse]`。
 * 这个类的方法用于；
 * 1. assert 结果是成功或错误的情况
 * 2. narrow 类型，以便 TypeScript 能够正确推断结果的属性。
 *
 * @example
 * ```TypeScript
 * const orderResultGuard: ErrorResultGuard<AddItemToOrderResult>
 *   = createErrorResultGuard(order => !!order.lines);
 *
 * it('errors when quantity is negative', async () => {
 *    const { addItemToOrder } = await shopClient.query<AddItemToOrder.Query, AddItemToOrder.Mutation>(ADD_ITEM_TO_ORDER, {
 *      productVariantId: 42, quantity: -1,
 *    });
 *
 *    // The test will fail
 *    orderResultGuard.assertErrorResult(addItemToOrder);
 *
 *    // the type of `addItemToOrder` has now been
 *    // narrowed to only include the ErrorResult types.
 *    expect(addItemToOrder.errorCode).toBe(ErrorCode.NegativeQuantityError);
 * }
 * ```
 * @docsCategory testing
 */
export class ErrorResultGuard<T> {
    constructor(private testFn: (input: T) => boolean) {}

    /**
     * @description
     * 一个类型 guard，如果输入通过 `testFn` 则返回 `true`
     */
    isSuccess(input: T | any): input is T {
        return this.testFn(input as T);
    }

    /**
     * @description
     * Asserts（使用测试库的 `fall()` 函数）输入是成功，即它通过 `testFn`
     */
    assertSuccess<R>(input: T | R): asserts input is T {
        if (!this.isSuccess(input)) {
            fail(`Unexpected error: ${JSON.stringify(input)}`);
        }
    }

    /**
     * @description
     * Assets (使用测试库的 `fall()` 函数) 输入是不成功，即它没有通过 `testFn`
     */
    assertErrorResult<R>(input: T | R): asserts input is R {
        if (this.isSuccess(input)) {
            fail(`Should have errored`);
        }
    }
}
