// import { REQUEST_CONTEXT_KEY } from '@pickerjs/common';
import type { Request } from 'express';
import { REQUEST_CONTEXT_KEY } from '@pickerjs/core/dist/common/constants';
import type { AssetServerOptions } from './types';

/**
 * 资产请求的URL前缀处理方法
 * @param options
 */
export function getAssetUrlPrefixFn(options: AssetServerOptions) {
  const { assetUrlPrefix, route } = options;
  if (!assetUrlPrefix) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (request: Request, identifier: string) => `${request.protocol}://${request.get('host')}/${route}/`;
  }
  if (typeof assetUrlPrefix === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (...args: any[]) => assetUrlPrefix;
  }
  if (typeof assetUrlPrefix === 'function') {
    return (request: Request, identifier: string) => {
      const ctx = (request as any)[REQUEST_CONTEXT_KEY];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return assetUrlPrefix(ctx, identifier);
    };
  }
  throw new Error(`The assetUrlPrefix option was of an unexpected type: ${JSON.stringify(assetUrlPrefix)}`);
}
