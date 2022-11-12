"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WeChatComponentModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatComponentModule = void 0;
const common_1 = require("@nestjs/common");
const wechat_constants_1 = require("../wechat/wechat.constants");
const component_service_1 = require("./component.service");
let WeChatComponentModule = WeChatComponentModule_1 = class WeChatComponentModule {
    static register(options) {
        return {
            global: options.isGlobal,
            module: WeChatComponentModule_1,
            providers: [
                {
                    provide: component_service_1.ComponentService,
                    useValue: new component_service_1.ComponentService(options)
                }
            ],
            exports: [component_service_1.ComponentService]
        };
    }
    static forRootAsync(options) {
        const providers = [];
        if (options.useFactory) {
            providers.push({
                provide: wechat_constants_1.COMPONENT_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || []
            });
        }
        providers.push({
            provide: component_service_1.ComponentService,
            inject: [wechat_constants_1.COMPONENT_MODULE_OPTIONS],
            useFactory: (opt) => {
                return new component_service_1.ComponentService(opt);
            }
        });
        return {
            global: options.isGlobal,
            module: WeChatComponentModule_1,
            imports: options.imports,
            providers,
            exports: [component_service_1.ComponentService]
        };
    }
};
WeChatComponentModule = WeChatComponentModule_1 = __decorate([
    (0, common_1.Module)({})
], WeChatComponentModule);
exports.WeChatComponentModule = WeChatComponentModule;
