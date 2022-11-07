import {DynamicModule, Module, OnModuleInit} from '@nestjs/common';

import {CacheModule} from '../cache/cache.module';
import {ConfigModule, ConfigService} from '../config';
import {AssetService} from "./services/asset.service";
import {EventBusModule} from "../event-bus";
const workerControllers: any = [];

const services = [
    AssetService,
    ConfigService,
];

// const helpers = [
    // PasswordCipher,
    // ListQueryBuilder,
    // VerificationTokenGenerator,
    // NativeAuthenticationStrategy,
// ]

/**
 * ServiceCoreModule 是由 ServiceModule 内部导入的。这样的安排使得该模块只有一个实例被实例化，
 * 因此生命周期的钩子只运行一次。
 */
@Module({
    imports: [
        ConfigModule,
        CacheModule,
        EventBusModule,
    ],
    // providers: [...services, ...helpers, InitializerService],
    providers: [ ...services ],
    exports: [ ...services ],
})
export class ServiceCoreModule implements OnModuleInit {
    constructor(
        // private roleService: RoleService,
        // private administratorService: AdministratorService,
    ) {
    }
    async onModuleInit() {
        // await this.roleService.initRoles();
        // await this.administratorService.initAdministrators();
    }
}

/**
 * ServiceModule 负责服务层，即访问数据库和实现应用程序的主要业务逻辑。
 * 导出的 providers 在 ApiModule 中使用，ApiModule 负责将请求解析为适合服务层逻辑的格式。
 */
@Module({
    imports: [ServiceCoreModule, CacheModule],
    exports: [ServiceCoreModule, CacheModule],
})
export class ServiceModule {
    static forRoot(): DynamicModule {
        // if (!defaultOrmModule) {
        //     defaultOrmModule = MikroOrmModule.forRootAsync({
        //         imports: [ConfigModule],
        //         useFactory: (configService: ConfigService) => {
        //             return {
        //                 ...configService.dbConnectionOptions,
        //                 subscribers: [new FileDirectorySubscriber()],
        //             };
        //         },
        //         inject: [ConfigService],
        //     });
        // }

        return {
            module: ServiceModule,
            imports: [],
        };
    }

    // 提供给 Worker
    static forWorker(): DynamicModule {
        return {
            module: ServiceModule,
            // imports: [ workerOrmModule, ConfigModule ],
            imports: [ConfigModule],
            controllers: workerControllers,
        };
    }

    // 提供给 Plugin
    static forPlugin(): DynamicModule {
        return {
            module: ServiceModule,
            imports: [],
        };
    }

}
