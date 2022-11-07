import OSS from 'ali-oss';
import {Request} from 'express';
import {ReadStream} from 'fs';
import fs from 'fs-extra';
import {Stream} from 'stream';
import {AssetStorageStrategy} from "@picker-cc/core";

const STS = (OSS as any).STS;

export interface IUpToken {
    AccessKeyId: string;
    AccessKeySecret: string;
    SecurityToken: string;
    Expiration: string;
}

/**
 * @description
 * A persistence strategy which saves files to the local file system.
 *
 * @docsCategory AssetServerPlugin
 */
export class AliossAssetStorageStrategy implements AssetStorageStrategy {
    toAbsoluteUrl: ((request: Request, identifier: string) => string) | undefined;
    private sts: typeof STS;

    constructor(
        private readonly uploadPath: string,
        private readonly toAbsoluteUrlFn?: (request: Request, identifier: string) => string,
    ) {
        fs.ensureDirSync(this.uploadPath);
        if (toAbsoluteUrlFn) {
            this.toAbsoluteUrl = toAbsoluteUrlFn;
        }

        this.sts = new STS({
            accessKeyId: '',
            accessKeySecret: '',
        });
    }

    async writeFileFromStream(fileName: string, data: ReadStream): Promise<string> {
        // const filePath = path.join(this.uploadPath, fileName);
        // await fs.ensureDir(path.dirname(filePath));
        // const writeStream = fs.createWriteStream(filePath, 'binary');
        // return new Promise<string>((resolve, reject) => {
        //     data.pipe(writeStream);
        //     writeStream.on('close', () => resolve(this.filePathToIdentifier(filePath)));
        //     writeStream.on('error', reject);
        // });
        return await this.uploadFile(fileName, data, 'oss-cn-beijing', 'picker').then(result => {
            // console.log(result);
            // return result.
            return '';
        }).catch(error => {
            // console.warn('---', error);
            return 'error';
        });
    }

    async writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
        // const filePath = path.join(this.uploadPath, fileName);
        // await fs.ensureDir(path.dirname(filePath));
        // await fs.writeFile(filePath, data, 'binary');
        // return this.filePathToIdentifier(filePath);
        return await this.uploadFile(fileName, data, 'oss-cn-beijing', 'picker').then(result => {
            // console.log(result);
            // return result.
            return '';
        }).catch(error => {
            // console.warn('---', error);
            return 'error';
        });
    }

    async fileExists(fileName: string): Promise<boolean> {
        // return new Promise(resolve => {
        //     fs.access(this.identifierToFilePath(fileName), fs.constants.F_OK, err => {
        //         resolve(!err);
        //     });
        // });
        // return await this.getOssClient().get(fileName);
        return this.getToken().then(token => {
            const client: OSS = new OSS({
                region: 'oss-cn-beijing',
                bucket: 'picker',
                accessKeyId: token.AccessKeyId,
                accessKeySecret: token.AccessKeySecret,
                stsToken: token.SecurityToken,
                secure: true
            });
            return client.get(fileName).then(result => {
                return result.res.status === 200;
            }).catch((e) => {
                return false;
            });
        });

    }

    readFileToBuffer(identifier: string): Promise<Buffer> {
        // return fs.readFile(this.identifierToFilePath(identifier));
        return this.getToken().then(token => {
            const client: OSS = new OSS({
                region: 'oss-cn-beijing',
                bucket: 'picker',
                accessKeyId: token.AccessKeyId,
                accessKeySecret: token.AccessKeySecret,
                stsToken: token.SecurityToken,
                secure: true
            });
            return client.get(identifier).then(result => {
                // return result.res.status === 200;
                return result.content
            }).catch((e) => {
                return false;
            });
        });
    }

    readFileToStream(identifier: string): Promise<Stream> {
        // const readStream = fs.createReadStream(this.identifierToFilePath(identifier), 'binary');
        // return Promise.resolve(readStream);
        return this.getToken().then(token => {
            const client: OSS = new OSS({
                region: 'oss-cn-beijing',
                bucket: 'picker',
                accessKeyId: token.AccessKeyId,
                accessKeySecret: token.AccessKeySecret,
                stsToken: token.SecurityToken,
                secure: true
            });
            return client.get(identifier).then(result => {
                // return result.res.status === 200;
                return result.content
            }).catch((e) => {
                return false;
            });
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
    public async getToken(): Promise<IUpToken> {
        // acs:ram::123456789012****:role/adminrole
        const response = await this.sts.assumeRole(
            // APP_CONFIG.CLOUD_STORAGE.aliyunAcsARN,
            // $accountID：云账号ID。您可以通过登录阿里云控制台，将鼠标悬停在右上角头像的位置，单击安全设置进行查看。
            // $roleName：RAM角色名称。您可以通过登录RAM控制台，单击左侧导航栏的RAM角色管理，在RAM角色名称列表下进行查看。
            'acs:ram::1950211040722694:role/caixiepickerossrole',
            null,
            15 * 60,
            'session-name',
        );
        // console.log('get token ...');
        // console.log(response);
        return response.credentials;
    }

    private getOssClient(): Promise<OSS> {
        // return await this.uploadFile(fileName, data, 'oss-cn-beijing', 'picker').then(result => {
        return this.getToken().then(token => {
            const client: OSS = new OSS({
                region: 'oss-cn-beijing',
                bucket: 'picker',
                accessKeyId: token.AccessKeyId,
                accessKeySecret: token.AccessKeySecret,
                stsToken: token.SecurityToken,
                secure: true
            });
            return client;
        });

    }

    // 上传文件
    public async uploadFile(name: string, file: any, region: string, bucket: string): Promise<{ name: string, data: object }> {
        return this.getToken().then(token => {
            let client: OSS = new OSS({
                region,
                bucket,
                accessKeyId: token.AccessKeyId,
                accessKeySecret: token.AccessKeySecret,
                stsToken: token.SecurityToken,
                secure: true,
            });
            // client.get()
            return client.put(name, file).finally(() => {
                // @ts-ignore
                client = null;
            });
        });
        // return await this.getOssClient().put(name, file)
    }

}
