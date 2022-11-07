import {config as typeInfoConfig, createAuth, DefaultLogger, LogLevel, PickerConfig, statelessSessions} from '@picker-cc/core';
import {ADMIN_API_PATH, API_PORT} from "@picker-cc/common/lib/shared-constants";

import {User} from "./schemas/User";

const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionConfig = {
    maxAge: sessionMaxAge,
    secret: sessionSecret,
};

const schemaConfig = typeInfoConfig({
    db: {
        provider: 'sqlite',
        url: 'file:./dev.db',
    },
    models: {
        User
    },
    session: statelessSessions(sessionConfig),
    experimental: {
        generateNodeAPI: true
    }
})
const {withAuth} = createAuth({
    listKey: 'User',
    identityField: 'identifier',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'identifier', 'password']
    },
    // sessionData: `
    // `
})
const withAuthSchemaConfig = withAuth(schemaConfig)
/**
 * 配置开发期间使用的设置
 */
export const config: PickerConfig = {
    // graphqlSchema: customSchema,
    // context: schemaContext,
    shouldDropDatabase: true,
    schemaConfig: withAuthSchemaConfig,
    context: null,
    apiOptions: {
        port: API_PORT,
        appApiPath: ADMIN_API_PATH,
        appApiPlayground: {
            settings: {
                'request.credentials': 'include',
            } as any,
        },
        appApiDebug: true,
        // cors: true,
    },
    logger: new DefaultLogger({ level: LogLevel.Info}),
    plugins: [
        // AssetServerPlugin.init({
        //     route: 'assets',
        //     assetUploadDir: path.join(__dirname, 'assets')
        // }),
        // AdminUiPlugin.init({
        //     route: 'admin',
        //     port: 5001
        // })
        // CaixieAppPlugin.init({
        //     route: 'admin',
        //     port: 5001
        // })
        // AdminUiPlugin.init({
        //     route: 'admin',
        //     port: 5001,
        // })
    ],

};
/*
function getDbConfig(): Options {
    const dbType = process.env.DB || 'mongo';

    switch (dbType) {
        case 'mongo':
            return {
                type: 'mongo',
                dbName: 'picker',
                clientUrl:
                    'mongodb://localhost:27017',
                debug: true,
                highlighter: new MongoHighlighter(),
                // 用于 mongodb 初始化索引，如果 false Unique 不会有效
                // ensureIndexes: true,
                // options: {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // },

            };
        case 'postgres':
            return {
                type: 'postgresql',
                host: '127.0.0.1',
                port: 5432,
                user: 'postgres',
                password: 'postgrespassword',
                dbName: 'postgres',
            };
        case 'mysql':
        default:
            return {
                type: 'mongo',
                dbName: 'picker',
                // dbName: 'jiyang-prod',
                clientUrl:
                // 'mongodb://root:Jiyang%402021@dds-uf699f07b49406841691-pub.mongodb.rds.aliyuncs.com:3717,dds-uf699f07b49406842436-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-55616169',
                    'mongodb://localhost:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
                debug: true,
                highlighter: new MongoHighlighter(),
                // options: {
                //     useNewUrlParser: true,
                //     useUnifiedTopology: true,
                // }
            };
    }
}
*/

