import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { WeChatService} from '@pickerjs/wechat-plugin';
import { Ctx, RequestContext } from '@pickerjs/core';
import type { Request, Response } from 'express';
import { MediaCheckAsyncResult } from '@pickerjs/wechat-plugin/lib/src/interfaces/result';

@Controller('wechat')
export class WechatController {
  constructor(private wechatService: WeChatService) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Ctx() ctx: RequestContext, @Req() req: Request, @Res() res: Response) {
    // console.log(this.wechatService.mp)
    await this.wechatService.mp.verifyMessagePush(req, res);
  }

  @Post()
  async post(@Ctx() ctx: RequestContext, @Req() req: Request, @Res() res: Response) {
    // console.log(req.body)
    // req.body
    if (req.body) {
      const mediaCheck: MediaCheckAsyncResult = req.body as MediaCheckAsyncResult;
      // console.log(msgSecCheckResult)
      // if (ms)
      console.log(mediaCheck);
      if (mediaCheck && mediaCheck.errcode === 0) {
        // if (result.MsgType === 'event') {
        // }
        if (mediaCheck.result) {
          // 更新资源状态
          if (mediaCheck.result.suggest === 'pass') {
            await ctx.picker.db.Asset.updateOne({
              where: {
                traceId: mediaCheck.trace_id
              },
              data: {
                status: 'APPROVED'
              }
            });
          } else {
            await ctx.picker.db.Asset.updateOne({
              where: {
                traceId: mediaCheck.trace_id
              },
              data: {
                status: 'SPAM'
              }
            });
          }
        }
      }
      // const MsgC
    }
    // res.send('success')
    res.status(200).json({ status: 'ok' });

    // await this.wechatService.mp.verifyMessagePush(req, res,)
  }
}
