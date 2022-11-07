import type { MiddlewareConsumer, NestModule, OnModuleInit } from '@nestjs/common';
// import { CACHE_MANAGER } from '@nestjs/common';
import type { EventBus, Type } from '@pickerjs/core';
import { Logger, PickerPlugin, PluginCommonModule } from '@pickerjs/core';
import { debounceTime } from 'rxjs';
import { SmsEvent } from './sms-event';
import type { SMSOptions } from './types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Core = require('@alicloud/pop-core');

@PickerPlugin({
  imports: [PluginCommonModule]
})
export class AliSmsPlugin implements NestModule, OnModuleInit {
  private static options: SMSOptions;

  private static smsClient: any;

  // eslint-disable-next-line no-useless-constructor
  constructor(private eventBus: EventBus) {}

  static init(options: SMSOptions): Type<AliSmsPlugin> {
    // eslint-disable-next-line no-param-reassign
    options = {
      ...options,
      endpoint: 'https://dysmsapi.aliyuncs.com',
      apiVersion: '2017-05-25'
    };
    // AliSmsPlugin.options = Object.assign(
    //     {},
    //     options,
    //     options.endpoint ?? 'https://dysmsapi.aliyuncs.com',
    //     options.apiVersion ?? '2017-05-25'
    // )
    AliSmsPlugin.options = options;
    AliSmsPlugin.smsClient = new Core(options);
    return this;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer): any {
    Logger.info('Creating Wechat server middleware');
  }

  onModuleInit() {
    const smsEvent$ = this.eventBus.ofType(SmsEvent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    smsEvent$.pipe(debounceTime(50)).subscribe(async (event: SmsEvent) => {
      // console.log('收到短信事件');
      // console.log(event);
      const phone = event.phone;
      const code = event.content;
      await this.sendCode(phone, AliSmsPlugin.options.codeSize, code);
    });
  }

  /**
   *
   * 发送验证码
   * @param phone string 手机号
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  sendCode(phone: string, codesize: number, code: string) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // let code = generateCode(codesize);
      const params = {
        PhoneNumbers: phone,
        SignName: AliSmsPlugin.options.SignName,
        TemplateCode: AliSmsPlugin.options.TemplateCode_Code,
        TemplateParam: JSON.stringify({
          code
        })
      };
      const requestOption = {
        method: 'POST'
      };
      let r: any;
      try {
        r = await AliSmsPlugin.smsClient.request('SendSms', params, requestOption);
      } catch (error) {
        reject(error);
      }
      if (r.Code === 'OK') {
        resolve(code);
      } else {
        reject(r);
      }
    });
  }
}
