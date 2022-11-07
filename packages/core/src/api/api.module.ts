import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {join} from 'path';

import {ConfigModule, ConfigService} from "../config";
import {ServiceModule} from "../service/service.module";

import {configureGraphQLModule} from "./config/configure-graphql-module";
import {I18nModule} from "../i18n/i18n.module";
import {createDynamicGraphQlModulesForPlugins, getPluginExports} from "../plugin/dynamic-plugin-api.module";
import {ModuleRef} from "@nestjs/core";
// import {Injector} from "../common";

@Module({
    imports: [
        ConfigModule,
        I18nModule,
        ServiceModule,
        ...createDynamicGraphQlModulesForPlugins(),
        configureGraphQLModule((configService) => ({
            // apiType: 'admin',
            apiPath: configService.apiOptions.appApiPath,
            playground: configService.apiOptions.appApiPlayground,
            debug: configService.apiOptions.appApiDebug,
            typePaths: [],
            // typePaths: [ 'common' ].map(p => join(__dirname, 'schema', p, '*.graphql')),
            // resolverModule: StudioApiModule,
            // validationRules: configService.apiOptions.appApiValidationRules   ,
        })),

    ],
    // exports: [
    //     ConfigModule,
    //     ServiceModule,
    // ],
    // providers: [
    //     RequestContextService,
    //     {
    //         provide: APP_GUARD,
    //         useClass: AuthGuard,
    //     },
    //     {
    //         provide: APP_INTERCEPTOR,
    //         useClass: TranslateErrorResultInterceptor,
    //     },
    //     {
    //         provide: APP_FILTER,
    //         useClass: ExceptionLoggerFilter,
    //     }
    // ]
})
export class ApiModule implements NestModule {
    constructor(
        private configService: ConfigService,
        private moduleRef: ModuleRef
    ) {
    }

    configure(consumer: MiddlewareConsumer): any {
        // const injector: any = new Injector(this.moduleRef);
        // const exports: any = getPluginExports()
        // console.log(exports)
        // exports.map((services: any) => {
        //     services.map(async (item: any) => {
        //         if (item.name === 'ScraperService') {
        //             // console.log(item.name)
        //             // await injector.resolve(item)
        //             // console.log(injector.get(item))
        //             injector.get(item).print()
        //             // console.log(injector.resolve(item))
        //         }
        //         // console.log(injector.resolve(item))
        //     })
        // })
        // console.log(injector.get('UserService'))
        // console.log(this.moduleRef.get('UserService'))
        // const { adminApiPath } = this.configService.apiOptions;
        // const { uploadMaxFileSize } = this.configService.assetOptions;

        // consumer
        //     .apply(graphqlUploadExpress({ maxFileSize: uploadMaxFileSize }))
        //     .forRoutes(adminApiPath);
    }
}
