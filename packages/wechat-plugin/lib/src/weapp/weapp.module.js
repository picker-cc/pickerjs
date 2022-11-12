"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WeAppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeAppModule = void 0;
const common_1 = require("@nestjs/common");
const weapp_service_1 = require("./weapp.service");
const wechat_constants_1 = require("../wechat/wechat.constants");
let WeAppModule = WeAppModule_1 = class WeAppModule {
    static register(options) {
        return {
            global: options.isGlobal,
            module: WeAppModule_1,
            providers: [
                {
                    provide: weapp_service_1.WeAppService,
                    useValue: new weapp_service_1.WeAppService(options)
                }
            ],
            exports: [weapp_service_1.WeAppService]
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: wechat_constants_1.WECHAT_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            });
        }
        providers.push({
            provide: weapp_service_1.WeAppService,
            inject: [wechat_constants_1.WECHAT_MODULE_OPTIONS],
            useFactory: (opt) => {
                return new weapp_service_1.WeAppService(opt);
            }
        });
        return {
            global: options.isGlobal,
            module: WeAppModule_1,
            imports: options.imports,
            providers,
            exports: [weapp_service_1.WeAppService]
        };
    }
};
WeAppModule = WeAppModule_1 = __decorate([
    (0, common_1.Module)({})
], WeAppModule);
exports.WeAppModule = WeAppModule;
