import { INestApplication } from '@nestjs/common';

/**
 * @description
 * 一个真实的风险测试服务器，端到端测试将在其上运行
 *
 * @docCategory testing
 */
import {DefaultLogger, Logger, PickerConfig} from "@picker-cc/core";
import {TestServerOptions} from "./types";
import { getInitializerFor } from './initializers/initializers';
import {NestFactory} from "@nestjs/core";
import {preBootstrapConfig} from "@picker-cc/core/dist/bootstrap";
import {populateForTesting} from "./data-population/populate-for-testing";

export class TestServer {
    public app: INestApplication;
    constructor(private pickerConfig: Required<PickerConfig>) {}

    /**
     * 通过 Picker 服务器实例，并根据选项填数据库，应该在 `beforeAll` 函数调用
     *
     * 将填充的数据保存到每个测试文件中的 .sqlite 文件中。在后续运行时，此文件加载，以便跳过填充步骤，这将显著加快测试速度
     * @param options
     */
    async init(options: TestServerOptions): Promise<void> {
        const { type } = this.pickerConfig.dbConnectionOptions;
        const { dbConnectionOptions } = this.pickerConfig
        const testFilename = this.getCallerFilename(1)
        const initializer = getInitializerFor(type)
        try {
            await initializer.init(testFilename, dbConnectionOptions);
            // const populateFn = () => this.populateInitialData(this.pickerConfig, options);
            // await initializer.populate(populateFn);
            // await initializer.destroy();
        } catch (e) {
            throw e;
        }
        await this.bootstrap()
    }

    /**
     * @description
     * 引导一个 Picker 服务器实例。通常应该使用 `.init()` 方法，因为它也会使用 populate 填充测试数据。
     * 然而，`bootstrap()` 方法在需要的测试中有时是有用的，多次启动和停止一个 Picker 实例，而不重新填充数据。
     */
    async bootstrap() {
        this.app = await this.bootstrapForTesting(this.pickerConfig);
    }
    /**
     * @description
     * 销毁 Picker 服务器实例并清理所有资源。
     * 应该在所有测试运行后调用，例如在 `afterAll` 函数中。
     */
    async destroy() {
        // allow a grace period of any outstanding async tasks to complete
        await new Promise(resolve => global.setTimeout(resolve, 500));
        await this.app.close();
    }

    private getCallerFilename(depth: number): string {
        let pst: ErrorConstructor['prepareStackTrace'];
        let stack: any;
        let file: any;
        let frame: any;

        pst = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, _stack) => {
            Error.prepareStackTrace = pst;
            return _stack;
        };

        stack = new Error().stack;
        stack = stack.slice(depth + 1);

        do {
            frame = stack.shift();
            file = frame && frame.getFileName();
        } while (stack.length && file === 'module.js');

        return file;
    }

    /**
     * 基于PopulateOptions填充.sqlite数据库文件。
     */
    private async populateInitialData(
        testingConfig: Required<PickerConfig>,
        options: TestServerOptions,
    ): Promise<void> {
        const app = await populateForTesting(testingConfig, this.bootstrapForTesting, {
            logging: false,
            ...options,
        });
        await app.close();
    }

    /**
     * Bootstraps an instance of the Vendure server for testing against.
     */
    private async bootstrapForTesting(userConfig: Partial<PickerConfig>): Promise<INestApplication> {
        const config = await preBootstrapConfig(userConfig);
        Logger.useLogger(config.logger);
        const appModule = await import('@picker-cc/core/dist/app.module');
        try {
            DefaultLogger.hideNestBoostrapLogs();
            const app = await NestFactory.create(appModule.AppModule, {
                cors: config.apiOptions.cors,
                logger: new Logger(),
            });
            await app.listen(config.apiOptions.port);
            // await app.get(JobQueueService).start();
            DefaultLogger.restoreOriginalLogLevel();
            return app;
        } catch (e) {
            // console.log(e);
            throw e;
        }
    }
}
