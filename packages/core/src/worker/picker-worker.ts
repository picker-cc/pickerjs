import { INestApplicationContext } from '@nestjs/common';

// import { JobQueueService } from '../job-queue/job-queue.service';

import { WorkerHealthCheckConfig, WorkerHealthService } from './worker-health.service';

/**
 * @description
 * 这个对象是通过调用 {@link bootstrapWorker} 函数创建的。
 *
 * @docsCategory worker
 */
export class PickerWorker {
    /**
     * @description
     * 对 `INestApplicationContext` 对象的引用，
     * 它代表了 NestJS[独立应用程序](https://docs.nestjs.com/standalone-applications) 实例。
     */
    public app: INestApplicationContext;

    constructor(app: INestApplicationContext) {
        this.app = app;
    }

    /**
     * @description
     * 启动作业队列，以便 worker 可以处理后台作业。
     */
    async startJobQueue(): Promise<PickerWorker> {
        // await this.app.get(JobQueueService).start();
        return this;
    }

    /**
     * @description
     * 启动一个简单的 http 服务器，可以用作工作实例的健康检查。
     * 这个 endpoint 可以被窗口业务流程服务（如Kubernetes）用来验证 worker 是否正在运行。
     *
     */
    async startHealthCheckServer(healthCheckConfig: WorkerHealthCheckConfig): Promise<PickerWorker> {
        await this.app.get(WorkerHealthService).initializeHealthCheckEndpoint(healthCheckConfig);
        return this;
    }
}
