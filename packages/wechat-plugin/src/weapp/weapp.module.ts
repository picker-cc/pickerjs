import { DynamicModule, Module, Provider } from '@nestjs/common';
import { WeChatModuleOptions, WeChatModuleRootOptions } from '../../index';
import { WECHAT_MODULE_OPTIONS } from '../wechat/wechat.constants';
import { WeAppService } from './weapp.service';

@Module({})
export class WeAppModule {
  public static register(options: WeChatModuleOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: WeAppModule,
      providers: [
        {
          provide: WeAppService,
          useValue: new WeAppService(options)
        }
      ],
      exports: [WeAppService]
    };
  }

  public static forRootAsync(options: WeChatModuleRootOptions): DynamicModule {
    const providers: Provider[] = [];
    if (options.useFactory) {
      providers.push({
        provide: WECHAT_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      });
    }
    providers.push({
      provide: WeAppService,
      inject: [WECHAT_MODULE_OPTIONS],
      useFactory: (opt: WeChatModuleOptions) => {
        return new WeAppService(opt);
      }
    });
    return {
      global: options.isGlobal,
      module: WeAppModule,
      imports: options.imports,
      providers,
      exports: [WeAppService]
    };
  }
}
