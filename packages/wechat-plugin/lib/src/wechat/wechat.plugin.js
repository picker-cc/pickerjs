"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WechatPlugin_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatPlugin = void 0;
const core_1 = require("@pickerjs/core");
const wechat_module_1 = require("./wechat.module");
const wechat_controller_1 = require("./wechat.controller");
let WechatPlugin = WechatPlugin_1 = class WechatPlugin {
    static init(options) {
        WechatPlugin_1.options = options;
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configure(consumer) {
        core_1.Logger.info('Creating Wechat server middleware');
    }
    onModuleInit() {
        // throw new Error("Method not implemented.");
    }
};
WechatPlugin = WechatPlugin_1 = __decorate([
    (0, core_1.PickerPlugin)({
        imports: [
            core_1.PluginCommonModule,
            wechat_module_1.WeChatModule.forRootAsync({
                inject: [],
                useFactory: (cache) => ({
                    isGlobal: true,
                    appId: WechatPlugin_1.options.appId,
                    secret: WechatPlugin_1.options.secret,
                    token: WechatPlugin_1.options.token,
                    encodingAESKey: WechatPlugin_1.options.encodingAESKey
                    // cacheAdapter: new RedisCache(cache),
                })
            })
        ],
        controllers: [wechat_controller_1.WechatController],
        providers: [
        // WeChatService,
        // {
        //     provide: WeChatService,
        //     useValue: new WeChatService(WechatPlugin.options),
        // }
        ],
        exports: []
    })
], WechatPlugin);
exports.WechatPlugin = WechatPlugin;
