import { DynamicModule } from '@nestjs/common';
import { WeChatModuleOptions, WeChatModuleRootOptions } from '../../index';
export declare class WeAppModule {
    static register(options: WeChatModuleOptions): DynamicModule;
    static forRootAsync(options: WeChatModuleRootOptions): DynamicModule;
}
