import { isClassInstance, isObject } from '@pickerjs/common/lib/shared-utils';
import { simpleDeepClone } from '@pickerjs/common/lib/simple-deep-clone';

import { PartialPickerConfig, PickerConfig } from './picker-config';

/**
 * @description
 * Performs a deep merge of two PickerConfig objects. Unlike `Object.assign()` the `target` object is
 * not mutated, instead the function returns a new object which is the result of deeply merging the
 * values of `source` into `target`.
 *
 * @example
 * ```TypeScript
 * const result = mergeConfig(defaultConfig, {
 *   assetOptions: {
 *     uploadMaxFileSize: 5000,
 *   },
 * };
 * ```
 *
 * @docsCategory configuration
 */
export function mergeConfig<T extends PickerConfig>(target: T, source: PartialPickerConfig, depth = 0): T {
    if (!source) {
        return target;
    }

    if (depth === 0) {
        target = simpleDeepClone(target);
    }

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject((source as any)[key])) {
                if (!(target as any)[key]) {
                    Object.assign(target as any, { [key]: {} });
                }
                if (!isClassInstance((source as any)[key])) {
                    mergeConfig((target as any)[key], (source as any)[key], depth + 1);
                } else {
                    (target as any)[key] = (source as any)[key];
                }
            } else {
                Object.assign(target, { [key]: (source as any)[key] });
            }
        }
    }
    return target;
}
