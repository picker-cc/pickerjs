import { WeChatService } from "./wechat.service";
export declare class WechatController {
    private readonly wechatService;
    constructor(wechatService: WeChatService);
    test(): Promise<void>;
}
