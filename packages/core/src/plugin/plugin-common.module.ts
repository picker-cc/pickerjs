import { Module } from '@nestjs/common';

import { CacheModule } from '../cache/cache.module';
import { ConfigModule } from '../config';
import { EventBusModule } from '../event-bus';
import { I18nModule } from '../i18n/i18n.module';
import { ProcessContextModule } from '../process-context/process-context.module';
import {ServiceModule} from "../service/service.module";
import {PickerContextModule} from "../picker-context/picker-context.module";

/**
 * @description
 * 该模块提供标准插件所需要的公共服务，configuration、event bus 功能，它应该被导入到插件中，以避免为每个单独的插件重复导入。
 * The PluginCommonModule exports:
 * PluginCommonModule 导出：
 *
 * * `EventBusModule`, 允许注入 {@link EventBus} 服务.
 * * `ServiceModule` 允许注入任何不同的相关服务。
 * * `ConfigModule`, 允许注入配置服务 ConfigService
 * * `JobQueueModule`, 允许注册队列服务 {@link JobQueueService}.
 * * `HealthCheckModule`, 允许注入健康检查服务 {@link HealthCheckRegistryService}.
 *
 * @docsCategory plugin
 */
@Module({
    imports: [
        EventBusModule,
        ConfigModule,
        ServiceModule.forPlugin(),
        // JobQueueModule,
        // HealthCheckModule,
        CacheModule,
        I18nModule,
        ProcessContextModule,
        PickerContextModule,
    ],
    exports: [
        EventBusModule,
        ConfigModule,
        ServiceModule.forPlugin(),
        // JobQueueModule,
        // HealthCheckModule,
        CacheModule,
        I18nModule,
        ProcessContextModule,
        PickerContextModule,
    ],
})
export class PluginCommonModule {}
