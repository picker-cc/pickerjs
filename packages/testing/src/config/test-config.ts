import {DefaultAssetNamingStrategy, defaultConfig, mergeConfig, NoopLogger, PickerConfig} from "@picker-cc/core";
import {ADMIN_API_PATH} from "@picker-cc/common/lib/shared-constants";
import { TestingAssetPreviewStrategy } from './testing-asset-preview-strategy';
import { TestingAssetStorageStrategy } from './testing-asset-storage-strategy';
import { TestingEntityIdStrategy } from './testing-entity-id-strategy';

/**
 * @description
 * 用于 e2e 测试的 {@link PickerConfig} 对象。
 * 配置一些为e2e加密测试优化的特殊设置：
 *
 * * `entityIdStrategy: new TestingEntityIdStrategy()` This ID strategy uses auto-increment IDs but encodes all IDs
 * to be prepended with the string `'T_'`, so ID `1` becomes `'T_1'`.
 * * `logger: new NoopLogger()` 默认情况下不输出日志
 * * `assetStorageStrategy: new TestingAssetStorageStrategy()` 这种策略实际上并不将任何二进制数据持久化到磁盘。
 * * `assetPreviewStrategy: new TestingAssetPreviewStrategy()` 这个策略是 no-op 无操作状态。
 *
 * @docsCategory testing
 */
export const testConfig: Required<PickerConfig> = mergeConfig(defaultConfig, {
    apiOptions: {
        port: 3050,
        adminApiPath: ADMIN_API_PATH,
        cors: true
    },
    authOptions: {
        tokenMethod: 'bearer',
        requireVerification: true,
        // cookieOptions: {
        //     secret: 'some-secret'
        // },
    },
    logger: new NoopLogger(),
    // importExportOptions: {},
    assetOptions: {
        assetNamingStrategy: new DefaultAssetNamingStrategy(),
        assetStorageStrategy: new TestingAssetStorageStrategy(),
        assetPreviewStrategy: new TestingAssetPreviewStrategy(),
    },
})
