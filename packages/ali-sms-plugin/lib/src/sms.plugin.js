"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AliSmsPlugin_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliSmsPlugin = void 0;
const core_1 = require("@pickerjs/core");
const rxjs_1 = require("rxjs");
const sms_event_1 = require("./sms-event");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Core = require('@alicloud/pop-core');
let AliSmsPlugin = AliSmsPlugin_1 = class AliSmsPlugin {
    // eslint-disable-next-line no-useless-constructor
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    static init(options) {
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
        AliSmsPlugin_1.options = options;
        AliSmsPlugin_1.smsClient = new Core(options);
        return this;
    }
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
    configure(consumer) {
        core_1.Logger.info('Creating Wechat server middleware');
    }
    onModuleInit() {
        const smsEvent$ = this.eventBus.ofType(sms_event_1.SmsEvent);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        smsEvent$.pipe((0, rxjs_1.debounceTime)(50)).subscribe(async (event) => {
            // console.log('收到短信事件');
            // console.log(event);
            const phone = event.phone;
            const code = event.content;
            await this.sendCode(phone, AliSmsPlugin_1.options.codeSize, code);
        });
    }
    /**
     *
     * 发送验证码
     * @param phone string 手机号
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
    sendCode(phone, codesize, code) {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            // let code = generateCode(codesize);
            const params = {
                PhoneNumbers: phone,
                SignName: AliSmsPlugin_1.options.SignName,
                TemplateCode: AliSmsPlugin_1.options.TemplateCode_Code,
                TemplateParam: JSON.stringify({
                    code
                })
            };
            const requestOption = {
                method: 'POST'
            };
            let r;
            try {
                r = await AliSmsPlugin_1.smsClient.request('SendSms', params, requestOption);
            }
            catch (error) {
                reject(error);
            }
            if (r.Code === 'OK') {
                resolve(code);
            }
            else {
                reject(r);
            }
        });
    }
};
AliSmsPlugin = AliSmsPlugin_1 = __decorate([
    (0, core_1.PickerPlugin)({
        imports: [core_1.PluginCommonModule]
    }),
    __metadata("design:paramtypes", [Function])
], AliSmsPlugin);
exports.AliSmsPlugin = AliSmsPlugin;
//# sourceMappingURL=sms.plugin.js.map