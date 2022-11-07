import {
    registerInitializer,
    MongoInitializer,
    testConfig as defaultTestConfig,
} from '@picker-cc/testing'
import { Options } from '@mikro-orm/core';
import fs from 'fs-extra';
import path from 'path';

import { getPackageDir } from './get-package-dir';
import {MongoHighlighter} from "@mikro-orm/mongo-highlighter";
import {mergeConfig} from "@picker-cc/core";
// import {registerInitializer} from "@picker-cc/testing/lib/initializers/initalizers";

declare global {
    namespace NodeJS {
        interface Global {
            e2eServerPortsUsed: number[];
        }
    }
}

/**
 * 函数的初始 beforeAll() 函数使用了一个相对较长的超时 e2e 测试，是因为在第一次运行时
 * （总是在 CI 中）sqlite 数据库需要生成，这可能需要一段时间。
 */
export const TEST_SETUP_TIMEOUT_MS = process.env.E2E_DEBUG ? 1800 * 1000 : 120000;

const packageDir = getPackageDir();

// registerInitializer('sqljs', new SqljsInitializer(path.join(packageDir, '__data__')));
// registerInitializer('postgres', new PostgresInitializer());
// registerInitializer('mysql', new MysqlInitializer());
// registerInitializer('mariadb', new MysqlInitializer());

registerInitializer('mongo', new MongoInitializer())
/**
 * 对于 e2e 测试的本地调试，我们设置了一个非常长的超时值，否则测试将会超过默认超时5秒自动失败。
 */
if (process.env.E2E_DEBUG) {
    // tslint:disable-next-line:no-console
    console.log('E2E_DEBUG', process.env.E2E_DEBUG, ' - setting long timeout');
    jest.setTimeout(1800 * 1000);
} else {
    jest.setTimeout(15 * 1000);
}
/**
 * 增加 CI 中的默认超时，因为有效测试偶尔会因为超时失败。
 */
if (process.env.CI) {
    jest.setTimeout(30 * 1000);
}

export const testConfig = () => {
    const portsFile = path.join(__dirname, 'ports.json');
    fs.ensureFileSync(portsFile);
    let usedPorts: number[];
    try {
        usedPorts = fs.readJSONSync(portsFile) ?? [3010];
    } catch (e) {
        usedPorts = [3010];
    }
    const nextPort = Math.max(...usedPorts) + 1;
    usedPorts.push(nextPort);
    if (100 < usedPorts.length) {
        // reset the used ports after it gets 100 entries long
        usedPorts = [3010];
    }
    fs.writeJSONSync(portsFile, usedPorts);
    return mergeConfig(defaultTestConfig, {
        apiOptions: {
            port: nextPort,
            adminApiPlayground: true
        },
        // importExportOptions: {
        //     importAssetsDir: path.join(packageDir, 'fixtures/assets'),
        // },
        dbConnectionOptions: getDbConfig(),
    });
};

function getDbConfig(): Options {
    const dbType = process.env.DB || 'mongo';
    switch (dbType) {
        case 'mongo':
            return {
                type: 'mongo',
                dbName: 'picker',
                clientUrl: 'mongodb://localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
                debug: true,
                highlighter: new MongoHighlighter(),
                // 用于 mongodb 初始化索引，如果 false Unique 不会有效
                ensureIndexes: true,
            };
        default:
            return {
                type: 'mongo',
                dbName: 'picker',
                clientUrl: 'mongodb://localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
                debug: true,
                highlighter: new MongoHighlighter(),
                // 用于 mongodb 初始化索引，如果 false Unique 不会有效
                ensureIndexes: true,
            };
    }
}

