import {Asset, AssetListOptions, AssetType, CreateAssetInput} from '@picker-cc/common/lib/generated-types';
import { Injectable } from '@nestjs/common';
import slug from 'limax';
import mime from 'mime-types';
import path from 'path';
import { Stream } from 'stream';

import {notNullOrUndefined} from "@picker-cc/common/lib/shared-utils";
import {ConfigService, Logger} from "../../config";
// import {EventBus} from "../../event-bus";
import {RequestContext} from "../../api";
import {getAssetType} from "../../common";
// tslint:disable-next-line:no-var-requires
const sizeOf = require('image-size');

/**
 * @description
 * 包含 {@link Asset} 实体的相关业务方法
 */
@Injectable()
export class AssetService {

    // 允许的 mime 类型
    private permittedMimeTypes: Array<{ type: string; subtype: string }> = [];

    constructor(
        private configService: ConfigService,
        // private eventBus: EventBus,
    ) {
        this.permittedMimeTypes = this.configService.assetOptions.permittedFileTypes
            .map(val => (/\.[\w]+/.test(val) ? mime.lookup(val) || undefined : val))
            .filter(notNullOrUndefined)
            .map(val => {
                const [type, subtype] = val.split('/');
                return { type, subtype };
            });
    }

    // findOne(ctx: RequestContext, id: ID): Promise<AssetModel | undefined> {
    //     // return this.em.findOne(Asset, {
    //     //     id,
    //     // });
    //     return this.prismaService.asset.findFirst({
    //         where: {
    //             id: id.toString()
    //         }
    //     })
    // }

    // async findAll(ctx: RequestContext, options?: AssetListOptions): Promise<PaginatedList<Asset>> {
    //     const [items, totalItems] = await this.em.findAndCount(Asset, {});
    //     return {
    //         items,
    //         totalItems,
    //     };
    // }

    async createFromBuffer(ctx: RequestContext, data: any): Promise<Asset> {
        const { stream, filename, mimetype } = data;
        const asset = await this.createAssetInternal(stream, filename, mimetype);
        // this.eventBus.publish(new AssetEvent(ctx, asset, 'created'));
        return asset;
    }

    async create(ctx: RequestContext, input: CreateAssetInput): Promise<Asset> {
        // console.log(input)
        const { createReadStream, filename, mimetype } = await input.file;
        const stream = createReadStream();
        const asset = await this.createAssetInternal(stream, filename, mimetype);
        // if (isGraphQlErrorResult(result)) {
        //   return result;
        // }
        // this.eventBus.publish(new AssetEvent(ctx, asset, 'created'));
        return asset;
    }

    private async createAssetInternal(stream: Stream, filename: string, mimetype: string): Promise<Asset> {
        const { assetOptions } = this.configService;
        const { assetPreviewStrategy, assetStorageStrategy } = assetOptions;
        // console.log(assetStorageStrategy)
        const filenameSlug = slug(filename);
        // console.log(filenameSlug)
        const sourceFileName = await this.getSourceFileName(filenameSlug);
        const previewFileName = await this.getPreviewFileName(sourceFileName);
        const sourceFileIdentifier = await assetStorageStrategy.writeFileFromStream(sourceFileName, stream);
        const sourceFile = await assetStorageStrategy.readFileToBuffer(sourceFileIdentifier);
        let preview: Buffer;
        try {
            preview = await assetPreviewStrategy.generatePreviewImage(mimetype, sourceFile);
        } catch (e: any) {
            Logger.error(`无法创建资产(Asset)预览图像: ${e.message}`);
            throw e;
        }
        const previewFileIdentifier = await assetStorageStrategy.writeFileFromBuffer(
            previewFileName,
            preview,
        );
        const type = getAssetType(mimetype);
        const { width, height } = this.getDimensions(type === AssetType.IMAGE ? sourceFile : preview);
        const getFileTitle = (filename: any) => {
            if (filename.split('.').length > 0) {
                return filename.split('.')[0]
            }
            return filename
        }

        // await this.prismaService.asset.create({data: {
        //         type,
        //         width,
        //         height,
        //         name: path.basename(sourceFileName),
        //         title: getFileTitle(filename),
        //         fileSize: sourceFile.byteLength,
        //         mimeType: mimetype,
        //         source: sourceFileIdentifier,
        //         preview: previewFileIdentifier,
        //     }})
        const asset: Asset = {
            createdAt: undefined, tags: undefined, updatedAt: undefined,
            id: '',
            type,
            width,
            height,
            name: path.basename(sourceFileName),
            title: getFileTitle(filename),
            fileSize: sourceFile.byteLength,
            mimeType: mimetype,
            source: sourceFileIdentifier,
            preview: previewFileIdentifier,
            focalPoint: null
        };

        // await this.em.persistAndFlush(asset);
        return asset;
    }

    private getDimensions(imageFile: Buffer): { width: number; height: number } {
        try {
            const { width, height } = sizeOf(imageFile);
            return { width, height };
        } catch (e) {
            Logger.error(`Could not determine Asset dimensions: ` + e);
            return { width: 0, height: 0 };
        }
    }

    private async getSourceFileName(fileName: string): Promise<string> {
        const { assetOptions } = this.configService;
        return this.generateUniqueName(fileName, (name, conflict) =>
            assetOptions.assetNamingStrategy.generateSourceFileName(name, conflict),
        );
    }

    private async getPreviewFileName(fileName: string): Promise<string> {
        const { assetOptions } = this.configService;
        return this.generateUniqueName(fileName, (name, conflict) =>
            assetOptions.assetNamingStrategy.generatePreviewFileName(name, conflict),
        );
    }

    /**
     * 生成资源的唯一标识
     * @param inputFileName
     * @param generateNameFn
     */
    private async generateUniqueName(
        inputFileName: string,
        generateNameFn: (fileName: string, conflictName?: string) => string,
    ): Promise<string> {
        const { assetOptions } = this.configService;
        let outputFileName: string | undefined;
        do {
            outputFileName = generateNameFn(inputFileName, outputFileName);
        } while (await assetOptions.assetStorageStrategy.fileExists(outputFileName));
        return outputFileName;
    }
}
