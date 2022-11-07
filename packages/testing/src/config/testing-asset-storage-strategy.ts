import { Request } from 'express';
import { Readable, Stream, Writable } from 'stream';

import { getTestImageBuffer } from './testing-asset-preview-strategy';
import {AssetStorageStrategy} from "@picker-cc/core";

/**
 * 一种模拟存储策略，它实际上不在任何地方持久化资产。
 */
export class TestingAssetStorageStrategy implements AssetStorageStrategy {
    readFileToBuffer(identifier: string): Promise<Buffer> {
        return Promise.resolve(getTestImageBuffer());
    }

    readFileToStream(identifier: string): Promise<Stream> {
        const s = new Readable();
        s.push(identifier);
        s.push(null);
        return Promise.resolve(s);
    }

    toAbsoluteUrl(reqest: Request, identifier: string): string {
        const prefix = `test-url/`;
        return identifier.startsWith(prefix) ? identifier : `${prefix}${identifier}`;
    }

    writeFileFromBuffer(fileName: string, data: Buffer): Promise<string> {
        return Promise.resolve(`test-assets/${fileName}`);
    }

    writeFileFromStream(fileName: string, data: Stream): Promise<string> {
        const writable = new Writable();
        writable._write = (chunk, encoding, done) => {
            done();
        };
        return new Promise<string>((resolve, reject) => {
            data.pipe(writable);
            writable.on('finish', () => resolve(`test-assets/${fileName}`));
            writable.on('error', reject);
        });
    }

    fileExists(fileName: string): Promise<boolean> {
        return Promise.resolve(false);
    }

    deleteFile(identifier: string): Promise<void> {
        return Promise.resolve();
    }
}
