import {
    PickerPlugin,
    PluginCommonModule,
    registerPluginStartupMessage,
    Type,
} from '@picker-cc/core';
import { AssetStorageStrategy, Logger, RuntimePickerConfig } from '@picker-cc/core';
import {
    MiddlewareConsumer,
    NestModule,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { createHash } from 'crypto';
import express, { Express, NextFunction, Request, Response } from 'express';
import { fromBuffer } from 'file-type';
import fs from 'fs-extra';
import path from 'path';

import { loggerCtx } from './constants';
import { defaultAssetStorageStrategyFactory } from './default-asset-storage-strategy-factory';
import { HashedAssetNamingStrategy } from './hashed-asset-naming-strategy';
import { SharpAssetPreviewStrategy } from './sharp-asset-preview-strategy';
import { transformImage } from './transform-image';
import { AssetServerOptions, ImageTransformPreset } from './types';
import {AssetsController} from "./controller/asset.controller";
// import slug from 'limax';

export enum UploadTypesEnum {
    ANY = 'jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls',
    IMAGES = 'jpg|jpeg|png|gif',
    DOCS = 'pdf|docx|doc|xlsx|xls',
}

export const imageFileFilter = (req: any, file: any, callback: Function) => {
    // if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|docx|doc|xlsx|xls)$/)) {
    //     return callback(new Error('Only image files are allowed!'), false);
    // }
    // file.encoding = 'gbk'
    callback(null, true);
};

/**
 * @description
 * `AssetServerPlugin` 服务提供本地文件上传管理，也将支持配置其他存储策略，例如：阿里云，并支持实时图像转换
 *
 * # Example
 * ## 转换模式
 *
 * Asset 预览图像可以转换（调整尺寸 & 裁剪）在请求的 url 中添加查询参数：
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=500&h=300&mode=resize`
 *
 * 上面的 URL 将返回 宽 500px x 高 300px 的 `some-asset.jpg` 图像
 *
 * ### 预览模式
 *
 * `mode` 参数可以是裁剪 `crop` 或调整尺寸 `resize`。详见  [ImageTransformMode]({{< relref "image-transform-mode" >}})
 *
 * ### 焦点
 *
 * 当裁剪图像时（`mode=crop`），将试图在裁剪帧中保持图像最 "有特点" 的区域。它是通过寻找图像中熵值最高的区域（图像中的热点区域）。然而，有时这个并不完美，大部分仍可能被删除掉。
 *
 * 所以焦点的作用就是可以通过传递`fpx`和`fpy`查询参数来手动指定，这些是标准化座标（介于0 和 1 之间的数字）,所以 `fpx=0&fpy=0` 对应于图像的左上角。
 *
 * 例如，假设有一个非常宽的景观图像，我们想要修剪成正方形。主题是一所最左边的房子图像。下面的查询将把它裁剪成以房子为中心的正方形
 *
 * `http://localhost:3000/assets/landscape.jpg?w=150&h=150&mode=crop&fpx=0.2&fpy=0.7`
 *
 * ### 转换模式预设
 *
 * 预设可以定义允许使用单个预设名称，而不是指定的宽度、高度和模式。预设是通过 AssetServerOptions [presets property]({{< relref "asset-server-options" >}}#presets) 配置
 *
 * 例如，定义以下预置:
 *
 * ```ts
 * new AssetModule({
 *   // ...
 *   presets: [
 *     { name: 'my-preset', width: 85, height: 85, mode: 'crop' },
 *   ],
 * }),
 * ```
 *
 * 意味着请求:
 *
 * `http://localhost:3000/assets/some-asset.jpg?preset=my-preset`
 *
 * 等价于:
 *
 * `http://localhost:3000/assets/some-asset.jpg?w=85&h=85&mode=crop`
 *
 * AssetModule带有以下预置:
 *
 * name | width | height | mode
 * -----|-------|--------|-----
 * tiny | 50px | 50px | crop
 * thumb | 150px | 150px | crop
 * small | 300px | 300px | resize
 * medium | 500px | 500px | resize
 * large | 800px | 800px | resize
 *
 * ### 缓存
 * 默认情况下，AssetModule 将缓存每个转换的图像，所以转换只需要执行一次给定的配置。
 * 关闭缓存可以使用 `?cache=false` 查询参数。
 *
 * @docsCategory AssetServerPlugin
 */
@PickerPlugin({
    imports: [PluginCommonModule],
    controllers: [AssetsController],
    configuration: config => AssetServerPlugin.configure(config),
    providers: [AssetsController],
    // adminApiExtensions: {
    // }
})
export class AssetServerPlugin implements NestModule, OnApplicationBootstrap {
    private static assetStorage: AssetStorageStrategy;
    private readonly cacheDir = 'cache';
    private presets: ImageTransformPreset[] = [
        { name: 'tiny', width: 50, height: 50, mode: 'crop' },
        { name: 'thumb', width: 150, height: 150, mode: 'crop' },
        { name: 'small', width: 300, height: 300, mode: 'resize' },
        { name: 'medium', width: 500, height: 500, mode: 'resize' },
        { name: 'large', width: 800, height: 800, mode: 'resize' },
    ];
    private static options: AssetServerOptions;

    /**
     * @description
     * Set the plugin options.
     */
    static init(options: AssetServerOptions): Type<AssetServerPlugin> {
        AssetServerPlugin.options = options;
        return this;
    }

    /** @internal */
    static async configure(config: RuntimePickerConfig) {

        const storageStrategyFactory =
            this.options.storageStrategyFactory || defaultAssetStorageStrategyFactory;
        this.assetStorage = await storageStrategyFactory(this.options);
        config.assetOptions.assetPreviewStrategy = new SharpAssetPreviewStrategy({
            maxWidth: this.options.previewMaxWidth || 1600,
            maxHeight: this.options.previewMaxHeight || 1600,
        });
        config.assetOptions.assetStorageStrategy = this.assetStorage;
        config.assetOptions.assetNamingStrategy =
            this.options.namingStrategy || new HashedAssetNamingStrategy();
        return config;
    }

    /** @internal */
    onApplicationBootstrap(): void | Promise<void> {
        if (AssetServerPlugin.options.presets) {
            for (const preset of AssetServerPlugin.options.presets) {
                const existingIndex = this.presets.findIndex(p => p.name === preset.name);
                if (-1 < existingIndex) {
                    this.presets.splice(existingIndex, 1, preset);
                } else {
                    this.presets.push(preset);
                }
            }
        }

        const cachePath = path.join(AssetServerPlugin.options.assetUploadDir, this.cacheDir);
        return fs.ensureDirSync(cachePath);
    }

    configure(consumer: MiddlewareConsumer) {
        Logger.info('Creating asset server middleware', loggerCtx);
        consumer.apply(this.createAssetServer()).forRoutes(AssetServerPlugin.options.route);
        registerPluginStartupMessage('Asset server', AssetServerPlugin.options.route);
    }

    /**
     * 创建 Image server 实例
     */
    private createAssetServer() {
        const assetServer = express.Router();
        assetServer.use(this.sendAsset(), this.generateTransformedImage);
        return assetServer;
    }

    /**
     * Reads the file requested and send the response to the browser.
     */
    private sendAsset() {
        return async (req: Request, res: Response, next: NextFunction) => {
            // console.log(req)
            const key = this.getFileNameFromRequest(req);
            try {
                const file = await AssetServerPlugin.assetStorage.readFileToBuffer(key);
                let mimeType = this.getMimeType(key);
                if (!mimeType) {
                    mimeType = (await fromBuffer(file))?.mime || 'application/octet-stream';
                }
                res.contentType(mimeType);
                res.send(file);
            } catch (e) {
                const err = new Error('File not found');
                (err as any).status = 404;
                return next(err);
            }
        };
    }

    /**
     * 如果一个异常是由第一个处理程序抛出的，那么可能是因为正在请求一个还不存在的已转换的映像。
     * 在本例中，此处理程序将生成转换后的图像，将其保存到缓存中，并将结果作为响应提供。
     */
    private generateTransformedImage() {
        return async (err: any, req: Request, res: Response, next: NextFunction) => {
            if (err && (err.status === 404 || err.statusCode === 404)) {
                if (req.query) {
                    Logger.debug(`Pre-cached Asset not found: ${req.path}`, loggerCtx);
                    let file: Buffer;
                    try {
                        file = await AssetServerPlugin.assetStorage.readFileToBuffer(req.path);
                    } catch (err) {
                        res.status(404).send('Resource not found');
                        return;
                    }
                    const image = await transformImage(file, req.query as any, this.presets || []);
                    try {
                        const imageBuffer = await image.toBuffer();
                        if (!req.query.cache || req.query.cache === 'true') {
                            const cachedFileName = this.getFileNameFromRequest(req);
                            await AssetServerPlugin.assetStorage.writeFileFromBuffer(
                                cachedFileName,
                                imageBuffer,
                            );
                            Logger.debug(`Saved cached asset: ${cachedFileName}`, loggerCtx);
                        }
                        res.set('Content-Type', `image/${(await image.metadata()).format}`);
                        res.send(imageBuffer);
                        return;
                    } catch (e: any) {
                        Logger.error(e, 'AssetServerPlugin', e.stack);
                        res.status(500).send(e.message);
                        return;
                    }
                }
            }
            next();
        };
    }

    private getFileNameFromRequest(req: Request): string {
        const { w, h, mode, preset, fpx, fpy } = req.query;
        const focalPoint = fpx && fpy ? `_fpx${fpx}_fpy${fpy}` : '';
        let imageParamHash: string | null = null;
        if (w || h) {
            const width = w || '';
            const height = h || '';
            imageParamHash = this.md5(`_transform_w${width}_h${height}_m${mode}${focalPoint}`);
        } else if (preset) {
            if (this.presets && !!this.presets.find(p => p.name === preset)) {
                imageParamHash = this.md5(`_transform_pre_${preset}${focalPoint}`);
            }
        }

        if (imageParamHash) {
            return path.join(this.cacheDir, this.addSuffix(req.path, imageParamHash));
        } else {
            return req.path;
        }
    }

    private md5(input: string): string {
        return createHash('md5').update(input).digest('hex');
    }

    private addSuffix(fileName: string, suffix: string): string {
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext);
        const dirName = path.dirname(fileName);
        return path.join(dirName, `${baseName}${suffix}${ext}`);
    }

    /**
     * Attempt to get the mime type from the file name.
     */
    private getMimeType(fileName: string): string | undefined {
        const ext = path.extname(fileName);
        switch (ext) {
            case '.jpg':
            case '.jpeg':
                return 'image/jpeg';
            case '.png':
                return 'image/png';
            case '.gif':
                return 'image/gif';
            case '.svg':
                return 'image/svg+xml';
            case '.tiff':
                return 'image/tiff';
            case '.webp':
                return 'image/webp';
        }
    }
}
