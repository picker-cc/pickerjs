import { ReadStream } from 'fs';
import { Stream } from 'stream';
import OSS from 'ali-oss';
import { Request } from 'express';
import { Logger, AssetStorageStrategy } from '@pickerjs/core';
import { AssetServerOptions } from './types';
import { getAssetUrlPrefixFn } from './common';
import { loggerCtx } from './constants';

// const STS = (OSS as any).STS;
//
export interface IUpToken {
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration: string;
}

export interface AliOSSConfig {
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。
  // 强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: string;
  accessKeySecret: string;
  // Bucket 名称
  bucket: string;
  region:
    | 'oss-cn-hangzhou'
    | 'oss-cn-shanghai'
    | 'oss-cn-qingdao'
    | 'oss-cn-beijing'
    | 'oss-cn-shenzhen'
    | 'oss-cn-hongkong'
    | 'oss-us-west-1'
    | 'oss-ap-southeast-1'
    | string;
  endpoint?:
    | 'oss-cn-hangzhou.aliyuncs.com'
    | 'oss-cn-shanghai.aliyuncs.comgHai'
    | 'oss-cn-qingdao.aliyuncs.com'
    | 'oss-cn-beijing.aliyuncs.com'
    | 'oss-cn-shenzhen.aliyuncs.com'
    | 'oss-cn-hongkong.aliyuncs.com'
    | 'oss-us-west-1.aliyuncs.com'
    | 'oss-ap-southeast-1.aliyuncs.com'
    | string;
  // 设置上传回调URL，即回调服务器地址，用于处理应用服务器与OSS之间的通信。
  // OSS会在文件上传完成后，把文件上传信息通过此回调URL发送给应用服务器。
  // 例如callbackUrl填写为https://oss-demo.aliyuncs.com:23450。
  callbackUrl?: string;
  // 当您需要设置上传到OSS文件的前缀时，请配置此项，否则置空即可。
  dir?: string;
}

export function configureAliOSSAssetStorage(aliOSSConfig: AliOSSConfig) {
  return (options: AssetServerOptions) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { assetUrlPrefix, route } = options;
    const prefixFn = getAssetUrlPrefixFn(options);
    const toAbsoluteUrlFn = (request: Request, identifier: string): string => {
      if (!identifier) {
        return '';
      }
      const prefix = prefixFn(request, identifier);
      return identifier.startsWith(prefix) ? identifier : `${prefix}${identifier}`;
    };
    return new AliOSSAssetStorageStrategy(aliOSSConfig, toAbsoluteUrlFn);
  };
}

/**
 * @description
 * A persistence strategy which saves files to the local file system.
 *
 * @docsCategory AssetServerPlugin
 */
export class AliOSSAssetStorageStrategy implements AssetStorageStrategy {
  // private OSS: typeof import('ali-oss');
  // constructor(
  //   private aliOSSConfig: AliOSSConfig,
  //   public readonly toAbsoluteUrl: (request: Request, identifier: string) => string
  // ) {}
  private aliOSS: OSS;

  toAbsoluteUrl: ((request: Request, identifier: string) => string) | undefined;

  // private sts: typeof STS;

  constructor(
    private aliOSSConfig: AliOSSConfig,
    private readonly toAbsoluteUrlFn?: (request: Request, identifier: string) => string
  ) {
    // fs.ensureDirSync(this.uploadPath);
    if (toAbsoluteUrlFn) {
      this.toAbsoluteUrl = toAbsoluteUrlFn;
    }
    // const { accessKeyId, accessKeySecret, region, bucket } = this.aliOSSConfig;
    //
    // this.aliOSS = new OSS({
    //   region,
    //   bucket,
    //   accessKeyId,
    //   accessKeySecret
    // });
  }

  async init() {
    // const { accessKeyId, accessKeySecret, region, bucket } = this.aliOSSConfig;

    try {
      // this.aliOSS = new OSS({
      //   region,
      //   bucket,
      //   accessKeyId,
      //   accessKeySecret
      // });
      this.getOSSClient();
    } catch (e: any) {
      Logger.error(`未能实例化 Ali OSS 客户端。`, loggerCtx, e.stack);
    }
  }

  getOSSClient() {
    const { accessKeyId, accessKeySecret, region, bucket } = this.aliOSSConfig;

    const aliOSSClient = new OSS({
      region,
      bucket,
      accessKeyId,
      accessKeySecret
    });
    return aliOSSClient;
  }

  async writeFileFromStream(fileName: string, data: ReadStream): Promise<string> {
    const res = await this.uploadFile(fileName, data)
      .then(result => {
        // console.log(result);
        // console.log(result);
        // return result.
        // return '';
        return result.name;
      })
      .catch(error => {
        // console.warn('---', error);
        // return 'error';
        return error.toString();
      });
    return res;
    // return
  }

  async writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
    const res = await this.uploadFile(fileName, data)
      .then(result => {
        // console.log(result);
        // return result.
        // return '';
        return result.name;
      })
      .catch(error => {
        // console.warn('---', error);
        // return 'error';
        return error.toString();
      });
    return res;
    // retur
  }

  async fileExists(fileName: string): Promise<boolean> {
    const client = this.getOSSClient();
    return (
      client
        .get(fileName)
        // .get(`${this.aliOSSConfig.bucket}/${fileName}`)
        .then(result => {
          return result.res.status === 200;
        })
        .catch(notFoundErr => {
          // console.log(notFoundErr);
          return false;
        })
    );
  }

  readFileToBuffer(identifier: string): Promise<Buffer> {
    // const { accessKeyId, accessKeySecret, region, bucket } = this.aliOSSConfig;

    // console.log(identifier);
    const client = this.getOSSClient();

    return client
      .get(identifier)
      .then(result => {
        return result.content;
      })
      .catch(e => {
        return false;
      });
  }

  readFileToStream(identifier: string): Promise<Stream> {
    const client = this.getOSSClient();

    return client
      .get(identifier)
      .then(result => {
        return result.content;
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  }

  // private filePathToIdentifier(filePath: string): string {
  //     const filePathDirname = path.dirname(filePath);
  //     const deltaDirname = filePathDirname.replace(this.uploadPath, '');
  //     const identifier = path.join(deltaDirname, path.basename(filePath));
  //     return identifier.replace(/^[\\/]+/, '');
  // }
  //
  // private identifierToFilePath(identifier: string): string {
  //     const identifierToFile = path.join(this.uploadPath, identifier);
  //     return identifierToFile;
  // }
  //

  // 获取临时 Token
  // public async getToken(): Promise<IUpToken> {
  //   // acs:ram::123456789012****:role/adminrole
  //   const response = await this.sts.assumeRole(
  //     // APP_CONFIG.CLOUD_STORAGE.aliyunAcsARN,
  //     // $accountID：云账号ID。您可以通过登录阿里云控制台，将鼠标悬停在右上角头像的位置，单击安全设置进行查看。
  //     // $roleName：RAM角色名称。您可以通过登录RAM控制台，单击左侧导航栏的RAM角色管理，在RAM角色名称列表下进行查看。
  //     'acs:ram::1950211040722694:role/caixiepickerossrole',
  //     null,
  //     15 * 60,
  //     'session-name'
  //   );
  //   // console.log('get token ...');
  //   // console.log(response);
  //   return response.credentials;
  // }

  // private getOssClient(): Promise<OSS> {
  //   // return await this.uploadFile(fileName, data, 'oss-cn-beijing', 'picker').then(result => {
  //   return this.getToken().then(token => {
  //     const client: OSS = new OSS({
  //       region: 'oss-cn-beijing',
  //       bucket: 'picker',
  //       accessKeyId: token.AccessKeyId,
  //       accessKeySecret: token.AccessKeySecret,
  //       stsToken: token.SecurityToken,
  //       secure: true
  //     });
  //     return client;
  //   });
  // }

  // 上传文件
  public async uploadFile(
    name: string,
    file: any
    // region: string,
    // bucket: string
  ): Promise<{ name: string; data: object }> {
    // return this.getToken().then(token => {
    // const { accessKeyId, accessKeySecret, region, bucket } = this.aliOSSConfig;
    // let client: OSS = new OSS({
    //   region,
    //   bucket,
    //   accessKeyId,
    //   accessKeySecret,
    //   // stsToken: token.SecurityToken,
    //   secure: true
    // });
    // client.get()
    const client = this.getOSSClient();

    return client.put(name, file).finally(() => {
      this.aliOSS = null;
    });
    // });
    // return await this.getOssClient().put(name, file)
  }
}
