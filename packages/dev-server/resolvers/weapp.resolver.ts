import { Readable } from 'stream';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AssetService, Ctx, EventBus, RequestContext } from '@pickerjs/core';
import { PhoneNumberResult, WeChatService } from '@pickerjs/wechat-plugin';
import { MutationLoginArgs, Scalars } from '@pickerjs/common/lib/generated-types';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { UserEvent } from '../user-event';

export interface MutationWxLoginArgs {
  code: Scalars['String'];
}

export interface MutationWxPhoneLoginArgs {
  phoneCode: Scalars['String'];
  loginCode: Scalars['String'];
}

interface UserAuthenticationWithPasswordSuccess {
  sessionToken: string;
  // item: User!
}
interface UserAuthenticationWithPasswordFailure {
  message: string;
}
export type UserAuthenticationWithPasswordResult =
  | UserAuthenticationWithPasswordSuccess
  | UserAuthenticationWithPasswordFailure;

@Resolver()
export class WeappResolver {
  constructor(private wechatService: WeChatService, private assetService: AssetService, private eventBus: EventBus) {}

  // @Mutation('')
  /**
   * 微信一键登录
   * @param loginArgs
   */
  @Mutation('wxPhoneLogin')
  async wxPhoneLogin(@Args() loginArgs: MutationWxPhoneLoginArgs, @Ctx() ctx: RequestContext): Promise<any> {
    const ret = await this.wechatService.getAccountAccessToken();
    if (ret.errcode) {
      return ret;
    }
    const { data } = await this.wechatService.mp.getPhoneNumber(loginArgs.phoneCode, ret.access_token);
    // data.phone_info
    let phoneNumberResult: PhoneNumberResult = {
      errcode: 0,
      errmsg: '',
      phone_info: {
        phoneNumber: '',
        /**
         * 没有区号的手机号
         */
        purePhoneNumber: '',
        /**
         * 区号
         */
        countryCode: NaN,
        watermark: {
          timestamp: NaN,
          appid: ''
        }
      }
    };
    if (data.errmsg === 'ok') {
      phoneNumberResult = data;
      phoneNumberResult.phone_info = data.phone_info;
    }
    const phone = phoneNumberResult.phone_info.purePhoneNumber;

    const { openid, unionid, session_key } = await this.wechatService.mp.code2Session(loginArgs.loginCode);
    const findWechatUser = await ctx.picker.query.WechatUser.findOne({
      where: {
        openId: openid
      },
      query: `id openId unionId createdAt updatedAt user { id identifier }`
    });
    // console.log(findWechatUser)
    if (!findWechatUser) {
      const wechatUser = await ctx.picker.query.WechatUser.createOne({
        data: {
          openId: openid,
          unionId: unionid,
          // phone: phoneNumberResult.phone_info.purePhoneNumber,
          phone,
          user: {
            create: {
              identifier: phone,
              password: phone
            }
          }
        },
        query: `id openId unionId createdAt user { identifier password { isSet } }`
      });
      return wechatUser;
    }

    const findUser = await ctx.picker.db.User.findOne({
      where: {
        identifier: phone
      }
    });
    if (findUser) {
      const authenticated = await ctx.picker.graphql.run({
        query: `
        mutation($identifier: String!, $password: String!) {
        authenticateUserWithPassword(identifier: $identifier, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            sessionToken
            item { id }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
        `,
        variables: { identifier: findUser.identifier, password: findUser.identifier }
      });
      // console.log(authenticated.authenticateUserWithPassword.sessionToken);
    }
    return '';
  }

  private async authentication(
    @Ctx() ctx: RequestContext,
    identifier: string
  ): Promise<UserAuthenticationWithPasswordResult> {
    return ctx.picker.graphql.run({
      query: `
        mutation($identifier: String!, $password: String!) {
          authenticateUserWithPassword(identifier: $identifier, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item { id }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
            }
          }
      }
        `,
      // 密码暂时与 identifier 相同，仅为满足用户密码授权逻辑
      // 如果后期开放 PC 端可以考虑为用户提供密码修改或者手机登录、微信扫码登录等方式
      variables: { identifier, password: identifier }
    });

  }

  @Mutation('wxLogin')
  async wxLogin(
    @Args() loginArgs: MutationWxLoginArgs,
    @Ctx() ctx: RequestContext
  ): Promise<UserAuthenticationWithPasswordResult> {
    // ctx.picker.injector.get()
    //   const phone = await this.wechatService.mp.getPhoneNumber()
    // 1 获取微信用户
    const { openid, unionid, session_key } = await this.wechatService.mp.code2Session(loginArgs.code);
    // 2 查询是否已成为 user
    const findUser = await ctx.picker.query.User.findOne({
      where: {
        identifier: openid
      },
      query: `id avatar{ id }`
    });
    // 3 如果找到用户授权
    if (findUser) {
      this.eventBus.publish(new UserEvent('login', ctx, findUser));
      return await this.authentication(ctx, openid);
    } // 4 如果未找到用户，则创建微信用户、系统用户，并授权登录
    // 2 创建微信用户
    const findWechatUser = await ctx.picker.query.WechatUser.findOne({
      where: {
        openId: openid
      }
    });
    if (!findWechatUser) {
      const createdWechatUser = await ctx.picker.query.WechatUser.createOne({
        data: {
          openId: openid,
          unionId: unionid,
          user: {
            create: {
              identifier: openid,
              password: openid
            }
          }
        },
        query: `id openId unionId createdAt user{id}`
      });
      if (createdWechatUser) {
        this.eventBus.publish(new UserEvent('created', ctx, createdWechatUser.user));
        return await this.authentication(ctx, openid);
      }
    } else {
      // 仅创建系统用户
      const createdUser = await ctx.picker.query.User.createOne({
        data: {
          identifier: openid,
          password: openid
        }
      });
      if (createdUser) {
        this.eventBus.publish(new UserEvent('created', ctx, createdUser));
        return await this.authentication(ctx, openid);
      }
    }

    return {
      message: '授权失败'
    };
    // return {
    //   openid,
    //   unionid,
    //   session_key
    // };
  }

  private async initUserAvatar(@Ctx() ctx: RequestContext, userId: string) {
    const image = await axios.get(`https://api.multiavatar.com/${userId}.png?apikey=NhZMgczbRBeQu4`, {
      responseType: 'arraybuffer'
    });
    const data = [];
    const buffer = new Buffer(image.data);
    const genId = nanoid(4);

    const asset = await this.assetService.createFromBuffer(ctx, {
      filename: `${userId}${genId}.png`,
      mimetype: 'image/png',
      stream: buffer
    });

    console.log(asset);
  }
}
