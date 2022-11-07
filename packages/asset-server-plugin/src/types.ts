/**
 * @description
 * Specifies the way in which an asset preview image will be resized to fit in the
 * proscribed dimensions:
 * 调整资产预览图大的方式：
 *
 * * crop: crops the image to cover both provided dimensions
 * * resize: Preserving aspect ratio, resizes the image to be as large as possible
 * while ensuring its dimensions are less than or equal to both those specified.
 *
 * @docsCategory AssetServerPlugin
 */
import { AssetNamingStrategy, AssetStorageStrategy } from '@picker-cc/core';

/** 图像文件的转换模式 */
export type ImageTransformMode = 'crop' | 'resize';

/**
 * @description
 * 预设图像大的小配置选项
 *
 * 预设允许使用一个快捷的方式生成 asset 缩略图预览。
 * 例如内置一个 `tiny` 预置来生成一个 50px x 50px 的裁剪图，访问时就可以通过添加字符串
 * `preset=tiny` 到 asset url 中，来请求。
 *
 * `http://localhost:3000/assets/some-asset.jpg?preset=tiny`
 *
 * 等价于以下 URL:
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=50&h=50&mode=crop`
 * @docsCategory AssetServerPlugin
 */
export interface ImageTransformPreset {
    name: string;
    width: number;
    height: number;
    mode: ImageTransformMode;
}

/**
 * @description
 * AssetServerPlugin. 的配置选项
 *
 * @docsCategory AssetServerPlugin
 */
export interface AssetServerOptions {
    /**
     * @description
     * asset server 的路由
     */
    route: string;
    /**
     * @description
     *
     * 当使用 {@link LocalAssetStorageStrategy}时，将 asset 上传至本地目录
     */
    assetUploadDir: string;
    /**
     * @description
     * Asset 文件的完整URL前缀。示例："https://assets.picker.cc/"
     *
     * 如果没有配置，将尝试猜测请求和配置的路由，然后，除了最简单的情况，这个猜测可能不会得到正确的结果。
     */
    assetUrlPrefix?: string;
    /**
     * @description
     * 生成预览图像的最大宽度（px）
     *
     * @default 1600
     */
    previewMaxWidth?: number;
    /**
     * @description
     * 生成预览图像的最大高度（px）
     *
     * @default 1600
     */
    previewMaxHeight?: number;
    /**
     * @description
     * 图像转换预设 {@link ImageTransformPreset} 对象数组。
     */
    presets?: ImageTransformPreset[];
    /**
     * @description
     * 定义 asset 文件的命名策略
     *
     * @default HashedAssetNamingStrategy
     */
    namingStrategy?: AssetNamingStrategy;
    /**
     * @description
     * 用来配置 {@link AssetStorageStrategy} 的一个有用的函数。默认情况我们使用本地存储策略 {@link LocalAssetStorageStrategy},
     * 但当需要使用云存储时就需要用到它来进行配置
     *
     * @default () => LocalAssetStorageStrategy
     */
    storageStrategyFactory?: (
        options: AssetServerOptions,
    ) => AssetStorageStrategy | Promise<AssetStorageStrategy>;
}
