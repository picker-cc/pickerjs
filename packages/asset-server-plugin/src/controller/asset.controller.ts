import {Controller, Post, UploadedFile, UseInterceptors} from "@nestjs/common";
import {AssetService, Ctx, RequestContext} from "@picker-cc/core";
import {FileInterceptor} from "@nestjs/platform-express";
import {Readable} from "stream";
import {imageFileFilter} from "../plugin";
// const multerOptions = {
// }
/**
 * 上传文件使用的 REST API
 */
@Controller()
export class AssetsController {
    constructor(private assetService: AssetService) {
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: {fileSize: 1000 * 1024 * 1024},
            fileFilter: imageFileFilter,
        }),
    )
    async upload(
        @Ctx() ctx: RequestContext,
        @UploadedFile() file: any
    ) {
        console.log('上传文件中。。。')
        const stream = new Readable();
        stream.push(file.buffer);
        stream.push(null);

        return this.assetService.createFromBuffer(ctx, {
            filename: file.originalname,
            mimetype: file.mimetype,
            stream,
        });
    }
}
