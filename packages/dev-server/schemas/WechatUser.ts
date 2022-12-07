import {checkbox, integer, json, list, relationship, text} from "@pickerjs/core";
import {trackingFields} from "../utils";

export const WechatUser = list({
  fields: {
    // 所属的小程序应用 ID
    appId: text(),
    subscribed: checkbox({
      defaultValue: false
    }),
    openId: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true
      }
    }),
    unionId: text({
      isIndexed: 'unique',
    }),
    nickName: text({
      db: {
        isNullable: true
      }
    }),
    gender: integer(),
    language: text({
      db: {
        isNullable: true
      }
    }),
    city: text({
      db: {
        isNullable: true
      }
    }),
    province: text({
      db: {
        isNullable: true
      }
    }),
    country: text({
      db: {
        isNullable: true
      }
    }),
    // avatarUrl: text(),
    user: relationship({
      ref: 'User.wechat',
      many: false
    }),
    /**
     * {
     *     "errcode":0,
     *     "errmsg":"ok",
     *     "phone_info": {
     *         "phoneNumber":"xxxxxx",
     *         "purePhoneNumber": "xxxxxx",
     *         "countryCode": 86,
     *         "watermark": {
     *             "timestamp": 1637744274,
     *             "appid": "xxxx"
     *         }
     *     }
     * }
     */
    phone: json(),
    ...trackingFields,
  }
})
