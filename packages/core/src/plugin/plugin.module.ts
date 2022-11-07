import { DynamicModule, Module } from '@nestjs/common';

import { getConfig } from '../config/config-helpers';
import {ConfigModule, ConfigService} from '../config';

import { getModuleMetadata } from './plugin-metadata';
import {ModuleRef} from "@nestjs/core";
import {Injector} from "../common";

/**
 * 这个模块收集并重新导出插件中定义的所有的 providers，这样它们就可以在其他模块中使用。
 */
@Module({
    imports: [ConfigModule],
})
export class PluginModule {
    constructor() {
        // console.log(moduleRef.get(ConfigService))
    }
    static forRoot(): DynamicModule {
        return {
            module: PluginModule,
            imports: [...getConfig().plugins],
        };
    }
}
