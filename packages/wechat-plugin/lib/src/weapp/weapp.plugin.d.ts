import { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { Type } from '@pickerjs/core';
import { WeChatModuleOptions } from '../types';
export declare class WeAppPlugin implements NestModule, OnModuleInit {
    private static options;
    static init(options: WeChatModuleOptions): Type<WeAppPlugin>;
    configure(consumer: MiddlewareConsumer): any;
    onModuleInit(): void;
}
