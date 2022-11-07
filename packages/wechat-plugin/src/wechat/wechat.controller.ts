import {Controller, Get} from "@nestjs/common";
import {WeChatService} from "./wechat.service";
import {TemplateMessage} from "../interfaces";

@Controller('wechat')
export class WechatController {
    constructor(
        private readonly wechatService: WeChatService
    ) {
    }

    @Get()
    async test() {
        // const accessToken = await this.wechatService.getAccountAccessToken();
        // return accessToken
        // const message: TemplateMessage = {
        // }
        // await this.wechatService.sendTemplateMessage()
        // const followers = await this.wechatService.getFollowers()
        // followers.data.openid.map((openid) => {
        //
        // })
        // followers.data.openid.forEach(() => {})
        // 合一
        // okJLfvhKzbHIN9cflD0Mxzi-1lcE
        // ME
        // okJLfvhlXBDQtsjd1UelmVrKPR0g
        const openids = [
            "okJLfvhKzbHIN9cflD0Mxzi-1lcE",
            "okJLfvsizoouZdnRelQdY1lupgxk",
            "okJLfvhiP8RQfmZM10Z-Ou99kMwo",
            "okJLfvuI2rHgkNI1d1I4QtT7Ahmc",
            "okJLfvv6GNYmiqaoVGiKq7a9ywrQ",
            "okJLfvl2ckC7h6TwPEGawYRaGJz8",
            "okJLfvg-0NJ0xzPq1VX-eD9uRxVo",
            "okJLfvqe3m80utduxD0-cewup4sQ",
            "okJLfvioccoJn5wJovUubNURJ194",
            "okJLfvtME5cgkPDXpbAbfvf_8-Sk",
            "okJLfvs2NQSr17ZZaxoxWK_yNA6E",
            "okJLfvopOg_IUqlFlmJk_EVWvVkQ",
            "okJLfvqxS5evsJW1my66QSf2RaQo",
            "okJLfvsfhscijmRJGPWeQnXXlyg0",
            "okJLfvhlXBDQtsjd1UelmVrKPR0g",
            "okJLfvjV_tVhIetM8abCNBxS2TjQ",
            "okJLfvi-thVSz2Qeu09G_67yt5gM"
        ]
        // for(let openId of openids) {
        //     const userInfo = await this.wechatService.getUserInfo(openId)
        //     console.log(userInfo)
        // }
        // return followers
        const templateMessage: TemplateMessage = {
            touser: 'okJLfvhKzbHIN9cflD0Mxzi-1lcE' ,
            template_id: 'LmJOhaRp0Bjwr7uI959T8PDEvVY2VMQK_0mKQxxTc1I',
            miniprogram: {
                appid: 'wx25d35ab97e993e90'
            },
            data: {
                first: {
                    value: '您订阅的专栏发布了新作品，如有打扰可进入小程序取消订阅',
                    color: ''
                },
                // 操作人员
                keyword1: {
                    value: '佰晟'
                },
                // 更新时间
                keyword2: {
                    value: '2022-09029 08:48'
                },
                // 备注
                remark: {
                    value: '点击查看《如何打造伟大的产品与公司》-《Build》读书笔记'
                }
            },
            color: '#008be8'
        }
        const res = await this.wechatService.sendTemplateMessage(templateMessage)
        console.log(res)
    }

}
