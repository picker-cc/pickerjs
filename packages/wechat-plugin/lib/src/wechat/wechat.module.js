"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WeChatModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatModule = void 0;
const common_1 = require("@nestjs/common");
const wechat_constants_1 = require("./wechat.constants");
const wechat_service_1 = require("./wechat.service");
let WeChatModule = WeChatModule_1 = class WeChatModule {
    static register(options) {
        return {
            global: options.isGlobal,
            module: WeChatModule_1,
            providers: [{
                    provide: wechat_service_1.WeChatService,
                    useValue: new wechat_service_1.WeChatService(options),
                }],
            exports: [wechat_service_1.WeChatService],
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: wechat_constants_1.WECHAT_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            });
        }
        providers.push({
            provide: wechat_service_1.WeChatService,
            inject: [wechat_constants_1.WECHAT_MODULE_OPTIONS],
            useFactory: (opt) => {
                return new wechat_service_1.WeChatService(opt);
            },
        });
        return {
            global: options.isGlobal,
            module: WeChatModule_1,
            imports: options.imports,
            providers,
            exports: [wechat_service_1.WeChatService],
        };
    }
};
WeChatModule = WeChatModule_1 = __decorate([
    (0, common_1.Module)({})
], WeChatModule);
exports.WeChatModule = WeChatModule;
