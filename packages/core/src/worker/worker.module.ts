import { Module, OnApplicationShutdown } from '@nestjs/common';

import { ConfigModule } from '../config';
import { Logger } from '../config';
import { I18nModule } from '../i18n/i18n.module';
import { PluginModule } from '../plugin/plugin.module';
import { ProcessContextModule } from '../process-context/process-context.module';

import { WorkerHealthService } from './worker-health.service';

/**
 * 这是通过 `bootstrapWorker()` 引导工作进程时使用的主模块。
 * 它包含了与AppModule相同的导入，除了ApiModule，它不需要worker。
 * 省略ApiModule会大大增加启动时间(在测试中大约是4倍)。
 */
@Module({
    imports: [
        ProcessContextModule,
        ConfigModule,
        I18nModule,
        PluginModule.forRoot(),
    ],
    providers: [WorkerHealthService],
})
export class WorkerModule implements OnApplicationShutdown {
    async onApplicationShutdown(signal?: string) {
        if (signal) {
            Logger.info('收到 Worker 关闭信号:' + signal);
        }
    }
}
