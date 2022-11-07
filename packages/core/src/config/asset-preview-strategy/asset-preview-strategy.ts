import {Stream} from 'stream';

/**
 * @description
 * AssetPreviewStrategy决定如何创建资产的预览图像。的图像
 * 资产，这通常涉及到调整到合理的尺寸。其他文件类型
 * 可以用多种方式预览，例如:
 * -为音频文件生成的波形图像
 * -预览为pdf文件生成的图像
 * -水印添加到预览图像
 *
 * @docsCategory assets
 */
export interface AssetPreviewStrategy {
  generatePreviewImage(mimeType: string, data: Buffer): Promise<Buffer>;
}
