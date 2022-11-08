import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigService, PickerPlugin, PluginCommonModule, ProcessContext, Type } from '@pickerjs/core';
import { UploadController } from './controller/upload.controller';

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
    PluginCommonModule
    // UsersModule,
    // WeChatModule,
  ],
  providers: [],
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
