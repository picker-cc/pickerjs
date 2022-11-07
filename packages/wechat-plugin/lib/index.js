"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// export * from './src/wechat/wechat.module';
// export * from './src/wechat/wechat.service';
// export * from './src/component/component.module';
// export * from './src/component/component.service';
// export * from './src/utils';
__exportStar(require("./src/types"), exports);
__exportStar(require("./src/interfaces"), exports);
// export * from './src/miniprogram/miniprogram.service';
// export * from './src/miniprogram/miniprogram.params';
// export * from './src/miniprogram/miniprogram.result';
// export * from './src/mobile/mobile.module';
// export * from './src/mobile/mobile.service';
// export * from './src/mobile/mobile.types';
__exportStar(require("./src/wechat/wechat.plugin"), exports);
