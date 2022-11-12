import { DynamicModule, Provider } from '@nestjs/common';
import { ComponentModuleOptions, ComponentModuleRootOptions } from '../types';
import { ComponentService } from './component.service';
export declare class WeChatComponentModule {
    static register(options: ComponentModuleOptions): DynamicModule;
    static forRootAsync(options: ComponentModuleRootOptions): {
        global: boolean;
        module: typeof WeChatComponentModule;
        imports: (DynamicModule | import("@nestjs/common").Type<any> | Promise<DynamicModule> | import("@nestjs/common").ForwardReference<any>)[];
        providers: Provider<any>[];
        exports: (typeof ComponentService)[];
    };
}
