import { checkbox, integer, list, relationship, text, timestamp } from '@pickerjs/core';
import { trackingFields } from './utils';

export const WechatUser = list({
  ui: {},
  fields: {
    // 所属的小程序应用 ID
    appId: text(),
    subscribed: checkbox(),
    openId: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true
      }
    }),
    unionId: text({
      isIndexed: 'unique'
    }),
    phone: text({
      isIndexed: 'unique'
    }),
    nickName: text(),
    gender: integer(),
    language: text(),
    city: text(),
    province: text(),
    country: text(),
    avatarUrl: text(),
    user: relationship({
      ref: 'User.wechat',
      many: false
    }),
    deletedAt: timestamp({
      defaultValue: { kind: 'now' }
    }),
    // featured:
    ...trackingFields
    // administrator: relationship({
    //     ref: 'Administrator.user',
    // })
  }
});
