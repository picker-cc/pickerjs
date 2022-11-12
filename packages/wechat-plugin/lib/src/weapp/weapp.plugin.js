"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WeAppPlugin_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeAppPlugin = void 0;
const core_1 = require("@pickerjs/core");
const weapp_module_1 = require("./weapp.module");
let WeAppPlugin = WeAppPlugin_1 = class WeAppPlugin {
    static init(options) {
        WeAppPlugin_1.options = options;
        return this;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configure(consumer) {
        core_1.Logger.info('Creating Weapp server middleware');
    }
    onModuleInit() {
        // throw new Error("Method not implemented.");
    }
};
WeAppPlugin = WeAppPlugin_1 = __decorate([
    (0, core_1.PickerPlugin)({
        imports: [
            core_1.PluginCommonModule,
            weapp_module_1.WeAppModule.forRootAsync({
                inject: [],
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                useFactory: (cache) => ({
                    isGlobal: true,
                    appId: WeAppPlugin_1.options.appId,
                    secret: WeAppPlugin_1.options.secret,
                    token: WeAppPlugin_1.options.token,
                    encodingAESKey: WeAppPlugin_1.options.encodingAESKey
                    // cacheAdapter: new RedisCache(cache),
                })
            })
        ],
        providers: [
        // WeChatService,
        // {
        //     provide: WeChatService,
        //     useValue: new WeChatService(WechatPlugin.options),
        // }
        ],
        exports: []
    })
], WeAppPlugin);
exports.WeAppPlugin = WeAppPlugin;
