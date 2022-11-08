import { Readable } from 'stream';
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Ctx, AssetService, RequestContext } from '@pickerjs/core';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '@pickerjs/asset-server-plugin';
// const multerOptions = {
// }
/**
 * 上传文件使用的 REST API
 */
@Controller('dev')
export class UploadController {
  // eslint-disable-next-line no-useless-constructor
  constructor(private assetService: AssetService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1000 * 1024 * 1024 },
      fileFilter: imageFileFilter
    })
  )
  async upload(@Ctx() ctx: RequestContext, @UploadedFile() file: any) {
    const stream = new Readable();
    stream.push(file.buffer);
    stream.push(null);

    const assets = await this.assetService.createFromBuffer(ctx, {
      filename: file.originalname,
      mimetype: file.mimetype,
      stream
    });
    // console.log(assets)
    return assets;
  }
}
