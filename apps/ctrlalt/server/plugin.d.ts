import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigService, ProcessContext, Type } from "@pickerjs/core";
export interface PluginOptions {
    route: string;
    port: number;
}
export declare class CaixieAppPlugin implements NestModule {
    private configService;
    private processContext;
    private static options;
    constructor(configService: ConfigService, processContext: ProcessContext);
    static init(options: PluginOptions): Type<CaixieAppPlugin>;
    configure(consumer: MiddlewareConsumer): Promise<void>;
}
