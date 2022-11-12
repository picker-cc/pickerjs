import { CACHE_MANAGER, MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import { Logger, PickerPlugin, PluginCommonModule, Type } from '@pickerjs/core';
import { WeChatModuleOptions } from '../types';
import { WeChatModule } from './wechat.module';
import { WechatController } from './wechat.controller';

@PickerPlugin({
  imports: [
    PluginCommonModule,
    WeChatModule.forRootAsync({
      inject: [],
      useFactory: (cache: Cache) => ({
        isGlobal: true,
        appId: WechatPlugin.options.appId,
        secret: WechatPlugin.options.secret,
        token: WechatPlugin.options.token,
        encodingAESKey: WechatPlugin.options.encodingAESKey
        // cacheAdapter: new RedisCache(cache),
      })
    })
  ],
  controllers: [WechatController],
  providers: [
    // WeChatService,
    // {
    //     provide: WeChatService,
    //     useValue: new WeChatService(WechatPlugin.options),
    // }
  ],
  exports: []
})
export class WechatPlugin implements NestModule, OnModuleInit {
  private static options: WeChatModuleOptions;

  static init(options: WeChatModuleOptions): Type<WechatPlugin> {
    WechatPlugin.options = options;
    return this;
  }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer): any {
    Logger.info('Creating Wechat server middleware');
  }

  onModuleInit() {
    // throw new Error("Method not implemented.");
  }
}
