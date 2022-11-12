"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WeChatMobileModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeChatMobileModule = void 0;
const common_1 = require("@nestjs/common");
const mobile_service_1 = require("./mobile.service");
let WeChatMobileModule = WeChatMobileModule_1 = class WeChatMobileModule {
    static register(options) {
        return {
            global: options?.isGlobal,
            module: WeChatMobileModule_1,
            providers: [
                {
                    provide: mobile_service_1.MobileService,
                    useValue: new mobile_service_1.MobileService()
                }
            ],
            exports: [mobile_service_1.MobileService]
        };
    }
};
WeChatMobileModule = WeChatMobileModule_1 = __decorate([
    (0, common_1.Module)({})
], WeChatMobileModule);
exports.WeChatMobileModule = WeChatMobileModule;
