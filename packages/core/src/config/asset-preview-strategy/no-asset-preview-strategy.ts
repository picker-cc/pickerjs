
import { AssetPreviewStrategy } from './asset-preview-strategy';
import { InternalServerError } from '../../common/error/errors';

/**
 * 占位符策略，使用时只会抛出错误。
 */
export class NoAssetPreviewStrategy implements AssetPreviewStrategy {
    generatePreviewImage(mimeType: string, data: Buffer): Promise<Buffer> {
      throw new InternalServerError('error.no-asset-preview-strategy-configured');
    }
}
