import { MiddlewareConsumer, NestModule, OnModuleInit } from "@nestjs/common";
import { Type } from "@picker-cc/core";
import { WeChatModuleOptions } from "../types";
export declare class WechatPlugin implements NestModule, OnModuleInit {
    private static options;
    static init(options: WeChatModuleOptions): Type<WechatPlugin>;
    configure(consumer: MiddlewareConsumer): any;
    onModuleInit(): void;
}
