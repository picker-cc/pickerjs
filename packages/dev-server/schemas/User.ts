import { allowAll, integer, list, password, relationship, text } from '@pickerjs/core';

export const User = list({
  access: allowAll,
  fields: {
    name: text({ validation: { isRequired: true } }),
    identifier: text({
      validation: { isRequired: true },
      isIndexed: 'unique',
      isFilterable: true
    }),
    phone: text({
      // isIndexed: 'unique',
      db: {
        isNullable: true
      }
    }),
    email: text({
      // isIndexed: 'unique'
      db: {
        isNullable: true
      }
    }),
    // password 字段方法负责将内容处理为哈希值
    password: password({ validation: { isRequired: true } }),
    avatar: relationship({ ref: 'Asset' }),
    // 性别 0表示未定义，1表示男性，2表示女性
    gender: integer({
      defaultValue: 0
    }),
    // 一个用户会有多条内容，用户应该被博客内容的 `author` 字段关联，
    // 关于 relationship 的原理请务必阅读文档以深入理解：https://picker.cc/docs/guides/relationships#understanding-relationships
    posts: relationship({ ref: 'Post.user', many: true }),
    favorites: relationship({ ref: 'UserFavorite.user', many: true }),
    wechat: relationship({ ref: 'WechatUser.user', many: false })
  }
});
