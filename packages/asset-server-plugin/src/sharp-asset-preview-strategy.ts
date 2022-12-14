import path from 'path';
import sharp from 'sharp';
import { AssetType } from '@pickerjs/common/lib/generated-types';
import type { AssetPreviewStrategy } from '@pickerjs/core';
import { getAssetType } from '@pickerjs/core';

/**
 * 资产文件的预览策略
 */
export class SharpAssetPreviewStrategy implements AssetPreviewStrategy {
  constructor(
    private config: {
      maxHeight: number;
      maxWidth: number;
    }
  ) {}

  async generatePreviewImage(mimeType: string, data: Buffer): Promise<Buffer> {
    const assetType = getAssetType(mimeType);
    const { maxWidth, maxHeight } = this.config;

    if (assetType === AssetType.IMAGE) {
      // https://github.com/lovell/sharp/issues/2416
      // storage-resize-images "Corrupt JPEG data" error when uploaded from some phones
      // 一些 jpg 图片无法识别
      const image = sharp(data, { failOnError: false });
      const metadata = await image.metadata();
      const width = metadata.width || 0;
      const height = metadata.height || 0;
      if (maxWidth < width || maxHeight < height) {
        return image.resize(maxWidth, maxHeight, { fit: 'inside' }).toBuffer();
      }
      // return data;
      if (mimeType === 'image/svg+xml') {
        // 将 SVG 转换为 raster 进行预览
        return image.toBuffer();
      }
      return data;
    }
    return sharp(path.join(__dirname, 'file-icon.png'))
      .resize(800, 800, { fit: 'outside' })
      .composite([
        {
          input: this.generateMimeTypeOverlay(mimeType),
          gravity: sharp.gravity.center
        }
      ])
      .toBuffer();
  }

  private generateMimeTypeOverlay(mimeType: string): Buffer {
    return Buffer.from(`
            <svg xmlns="http://www.w3.org/2000/svg" height="150" width="800">
            <style>
                text {
                   font-size: 64px;
                   font-family: Arial, sans-serif;
                   fill: #666;
                }
              </style>

              <text x="400" y="110"  text-anchor="middle" width="800">${mimeType}</text>
            </svg>`);
  }
}
