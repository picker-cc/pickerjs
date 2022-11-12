import { DynamicModule } from '@nestjs/common';
import { WeChatMobileModuleOptions } from './mobile.types';
export declare class WeChatMobileModule {
    static register(options?: WeChatMobileModuleOptions): DynamicModule;
}
