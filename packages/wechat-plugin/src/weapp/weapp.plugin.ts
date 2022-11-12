import { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { Logger, PickerPlugin, PluginCommonModule, Type } from '@pickerjs/core';
import { WeChatModuleOptions } from '../types';
import { WeAppModule } from './weapp.module';

@PickerPlugin({
  imports: [
    PluginCommonModule,
    WeAppModule.forRootAsync({
      inject: [],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: (cache: Cache) => ({
        isGlobal: true,
        appId: WeAppPlugin.options.appId,
        secret: WeAppPlugin.options.secret,
        token: WeAppPlugin.options.token,
        encodingAESKey: WeAppPlugin.options.encodingAESKey
        // cacheAdapter: new RedisCache(cache),
      })
    })
  ],
  providers: [
    // WeChatService,
    // {
    //     provide: WeChatService,
    //     useValue: new WeChatService(WechatPlugin.options),
    // }
  ],
  exports: []
})
export class WeAppPlugin implements NestModule, OnModuleInit {
  private static options: WeChatModuleOptions;

  static init(options: WeChatModuleOptions): Type<WeAppPlugin> {
    WeAppPlugin.options = options;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer): any {
    Logger.info('Creating Weapp server middleware');
  }

  onModuleInit() {
    // throw new Error("Method not implemented.");
  }
}
