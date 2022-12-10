import { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
import {
  AssetService,
  ConfigModule,
  ConfigService,
  EventBus,
  Picker,
  PickerPlugin,
  PluginCommonModule,
  ProcessContext,
  RequestContext,
  Type
} from '@pickerjs/core';
import { WeChatModule } from '@pickerjs/wechat-plugin';
import gql from 'graphql-tag';
import { debounceTime } from 'rxjs';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { UserEvent } from './user-event';
import { WeappResolver } from './resolvers/weapp.resolver';
import { UploadController } from './controller/upload.controller';
import { WechatController } from './controller/wechat.controller';

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
    // UsersModule,
    // WeChatModule,
    WeChatModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        appId: 'wx25d35ab97e993e90',
        secret: 'cab3cc059246334a4d93a387145c1c6f',
        token: 'caixie2022'
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
  providers: [],
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
    UploadController,
    WechatController
    // AppController
  ]
})
export class AppPlugin implements NestModule, OnModuleInit {
  private static options: PluginOptions;

  // eslint-disable-next-line no-useless-constructor,max-params
  constructor(
    private configService: ConfigService,
    private processContext: ProcessContext,
    private assetService: AssetService,
    private eventBus: EventBus,
    private readonly picker: Picker
  ) {}

  /**
   * @description
   * Set the plugin options
   */
  static init(options: PluginOptions): Type<AppPlugin> {
    this.options = options;
    return AppPlugin;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  async configure(consumer: MiddlewareConsumer) {}

  onModuleInit(): any {
    // const picker: Context = this.picker.context as Context

    const userEvent$ = this.eventBus.ofType(UserEvent);
    userEvent$.pipe(debounceTime(50)).subscribe(async event => {
      if (event.type === 'login') {
        const user = event.user;
        // console.log(user)
        if (!user.avatar || !user.avatar.id) {
          await this.initUserAvatar(event.ctx, event.user.id);
        }
      }
      if (event.type === 'created') {
        await this.initUserAvatar(event.ctx, event.user.id);
      }
    });
  }

  private async initUserAvatar(ctx: RequestContext, userId: string) {
    const image = await axios.get(`https://api.multiavatar.com/${userId}.png?apikey=NhZMgczbRBeQu4`, {
      responseType: 'arraybuffer'
    });
    const buffer = new Buffer(image.data);
    const genId = nanoid(4);

    const asset = await this.assetService.createFromBuffer(ctx, {
      filename: `${userId}${genId}.png`,
      mimetype: 'image/png',
      stream: buffer
    });
    const createdAsset = await ctx.picker.db.Asset.createOne({
      data: {
        type: asset.type,
        width: asset.width,
        height: asset.height,
        name: asset.name,
        title: asset.title,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType,
        source: asset.source,
        preview: asset.preview,
        focalPoint: asset.focalPoint
        // ...assets
      }
    });

    if (userId) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedUser = await ctx.picker.db.User.updateOne({
        where: {
          id: userId
        },
        data: {
          avatar: {
            connect: {
              id: createdAsset.id
            }
          }
        }
      });
      // console.log(updatedUser)
    }
    // console.log(assets)
    // return createdAsset;
    // console.log(asset)
  }
}
