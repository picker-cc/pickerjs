"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickerConfig = void 0;
const core_1 = require("@picker-cc/core");
const shared_constants_1 = require("@picker-cc/common/lib/shared-constants");
const User_1 = require("../schemas/User");
const Post_1 = require("../schemas/Post");
const plugin_1 = require("./plugin");
const wechat_plugin_1 = require("@picker-cc/wechat-plugin");
const auth_1 = require("./auth");
const sessionSecret = '-- DEV COOKIE SECRET; CHANGE ME --';
const sessionMaxAge = 60 * 60 * 24 * 30;
const sessionConfig = {
    maxAge: sessionMaxAge,
    secret: sessionSecret,
};
const schemaConfig = (0, core_1.config)({
    db: {
        provider: 'sqlite',
        url: 'file:./dev.db',
        useMigrations: true,
    },
    models: {
        User: User_1.User,
        Post: Post_1.Post,
    },
    session: (0, core_1.statelessSessions)(sessionConfig),
    experimental: {
        generateNodeAPI: true
    }
});
const { withAuth } = (0, auth_1.createAuth)({
    listKey: 'User',
    identityField: 'identifier',
    secretField: 'password',
    initFirstItem: {
        fields: ['name', 'identifier', 'password'],
        itemData: {
            isAdmin: true
        }
    },
    sessionData: `name isAdmin`
});
const withAuthConfig = withAuth(schemaConfig);
exports.default = withAuthConfig;
exports.pickerConfig = {
    shouldDropDatabase: true,
    schemaConfig: withAuthConfig,
    context: null,
    apiOptions: {
        port: shared_constants_1.API_PORT,
        appApiPath: shared_constants_1.ADMIN_API_PATH,
        appApiPlayground: {
            settings: {
                'request.credentials': 'include',
            },
        },
        appApiDebug: true,
    },
    logger: new core_1.DefaultLogger({ level: core_1.LogLevel.Info }),
    plugins: [
        wechat_plugin_1.WechatPlugin.init({
            appId: '',
            secret: '',
            token: 'PickerCC',
        }),
        plugin_1.CaixieAppPlugin.init({
            route: 'admin',
            port: 5001
        })
    ],
};
//# sourceMappingURL=picker-cc.js.map