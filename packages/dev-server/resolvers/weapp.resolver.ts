import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@pickerjs/core';
import { PhoneNumberResult, WeChatService } from '@pickerjs/wechat-plugin';
import { MutationLoginArgs, Scalars } from '@pickerjs/common/lib/generated-types';
import { WechatUser } from '../schemas/WechatUser';
export interface MutationWxLoginArgs {
  code: Scalars['String'];
}
export interface MutationWxPhoneLoginArgs {
  phoneCode: Scalars['String'];
  loginCode: Scalars['String'];
}
// export interface Mutation
@Resolver()
export class WeappResolver {
  constructor(private wechatService: WeChatService) {}

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
    let phoneNumberResult: PhoneNumberResult;
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
    console.log(authenticated.authenticateUserWithPassword.sessionToken);

    return '';
  }

  @Mutation('wxLogin')
  async wxLogin(@Args() loginArgs: MutationWxLoginArgs, @Ctx() ctx: RequestContext): Promise<any> {
    // ctx.picker.injector.get()
    //   const phone = await this.wechatService.mp.getPhoneNumber()
    // 1 获取微信用户
    const { openid, unionid, session_key } = await this.wechatService.mp.code2Session(loginArgs.code);
    // 2 创建微信用户
    const findWechatUser = await ctx.picker.query.WechatUser.findOne({
      where: {
        openId: openid
      }
    });
    if (!findWechatUser) {
      const wechatUser = await ctx.picker.query.WechatUser.createOne({
        data: {
          openId: openid,
          unionId: unionid
        },
        query: `id openId unionId createdAt`
      });
    }
    //   const wechatUser = await ctx.picker.db.user.createOne()
    // console.log(session_key)
    // console.log(openid)
    // const resJson = JSON.stringify({
    //   openid,
    //   session_key
    // });
    // console.log(resJson);
    // return data;
    return {
      openid,
      unionid,
      session_key
    };
  }
}
