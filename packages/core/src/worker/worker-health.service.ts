import { Injectable, OnModuleDestroy } from '@nestjs/common';
import express from 'express';
import http from 'http';

import { Logger } from '../config/logger/picker-logger';

/**
 * @description
 * 指定 Worker 的 HTTP 健康检查 endpoint 的配置。
 *
 * @docsCategory worker
 */
export interface WorkerHealthCheckConfig {
    /**
     * @description
     * worker 将要监听的端口
     */
    port: number;
    /**
     * @description
     * 主机名
     *
     * @default 'localhost'
     */
    hostname?: string;
    /**
     * @description
     * 健康检查可用的路由
     *
     * @default '/health'
     */
    route?: string;
}

@Injectable()
export class WorkerHealthService implements OnModuleDestroy {
    private server: http.Server | undefined;

    initializeHealthCheckEndpoint(config: WorkerHealthCheckConfig): Promise<void> {
        const { port, hostname, route } = config;
        const healthRoute = route || '/health';
        const app = express();
        const server = http.createServer(app);
        app.get(healthRoute, (req, res) => {
            res.send({
                status: 'ok',
            });
        });
        this.server = server;
        return new Promise((resolve, reject) => {
            server.on('error', err => {
                Logger.error(`无法启动 worker 运行状况端点服务器 (${err.toString()})`);
                reject(err);
            });
            server.on('监听中', () => {
                const endpointUrl = `http://${hostname || 'localhost'}:${port}${healthRoute}`;
                Logger.info(`Worker 运行状况检查端点: ${endpointUrl}`);
                resolve();
            });
            server.listen(port, hostname || '');
        });
    }

    onModuleDestroy(): any {
        return new Promise<void>(resolve => {
            if (this.server) {
                this.server.close(() => resolve());
            } else {
                resolve();
            }
        });
    }
}
