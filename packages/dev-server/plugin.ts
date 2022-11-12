import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService, PickerPlugin, PluginCommonModule, ProcessContext, Type } from '@pickerjs/core';
import { WeChatModule } from '@pickerjs/wechat-plugin';
import gql from 'graphql-tag';
import { UploadController } from './controller/upload.controller';
import { WeappResolver } from './resolvers/weapp.resolver';

/**
 * @description
 */
export interface PluginOptions {
  /**
   * @description
   * The route to the Admin UI.
   */
  route: string;
  /**
   * @description
   */
  port: number;
}

@PickerPlugin({
  imports: [
    PluginCommonModule,
    // WeChatModule.forRootAsync({
    //     useFactory: () => ({
    //         appId: 'wx25d35ab97e993e90',
    //         secret: 'c5a829b5bf3e128588769bbfacf029e6',
    //         token: '',
    //         encodingAESKey: '',
    //     })
    // }),
    // UsersModule,
    // WeChatModule,
    WeChatModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        appId: 'wx25d35ab97e993e90',
        secret: 'cab3cc059246334a4d93a387145c1c6f'
        // token: '',
        // encodingAESKey: ''
        // appId: configService.get('WX_APPID'),
        // secret: configService.get('WX_SECRET'),
        // token: configService.get('WX_TOKEN'),
        // encodingAESKey: configService.get('WX_AESKEY'),
        // cacheAdapter: new RedisCache(cache)
      })
    })
  ],
  // providers: [WeappResolver],
  apiExtensions: {
    schema: gql`
      extend type Mutation {
        wxLogin(code: String!): JSON
        wxPhoneLogin(phoneCode: String!, loginCode: String!): JSON
      }
    `,
    resolvers: [WeappResolver]
  },
  controllers: [
    UploadController
    // AppController
  ]
})
export class DevAppPlugin implements NestModule {
  private static options: PluginOptions;

  // eslint-disable-next-line no-useless-constructor
  constructor(private configService: ConfigService, private processContext: ProcessContext) {}

  /**
   * @description
   * Set the plugin options
   */
  static init(options: PluginOptions): Type<DevAppPlugin> {
    this.options = options;
    return DevAppPlugin;
  }

  // eslint-disable-next-line class-methods-use-this
  async configure(consumer: MiddlewareConsumer) {}
}
