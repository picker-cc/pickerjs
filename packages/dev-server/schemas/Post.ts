import { checkbox, integer, json, list, relationship, select, text, timestamp } from '@pickerjs/core';
import { trackingFields } from './utils';
import { access } from './auth-and-access-control';

export const Post = list({
  access: {
    operation: {
      create: access.isUser,
      delete: access.isUser
    },
    item: {
      // create: access.isSelf,
      update: access.isSelf,
      delete: access.isSelf
    }
  },
  fields: {
    title: text(),
    // 状态字段，用于控制是否显示内容
    status: select({
      type: 'enum',
      options: [
        { label: '已发布', value: 'published' },
        { label: '草稿', value: 'draft' }
      ],
      // 我们希望确保新的文章内容在创建时是以草稿的状态开始的
      defaultValue: 'draft',
      // 配置字段在 Admin UI 中的交互外观
      ui: {
        displayMode: 'segmented-control'
      }
    }),
    // assets:
    // content 字段应该是 document 用于富文本编辑器的外观
    // content: document({
    //   formatting: true,
    //   layouts: [
    //     [1, 1],
    //     [1, 1, 1],
    //     [2, 1],
    //     [1, 2],
    //     [1, 2, 1],
    //   ],
    //   links: true,
    //   dividers: true,
    // }),
    content: text(),
    publishDate: timestamp(),
    // 这里链接的是 post => author
    user: relationship({
      ref: 'User.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name', 'email'],
        inlineEdit: { fields: ['name', 'email'] },
        linkToItem: true,
        inlineConnect: true
      }
    }),
    // meta: json(),
    // style: json(),
    type: select({
      type: 'enum',
      options: [
        { label: '最爱', value: 'favorite' },
        { label: '回忆', value: 'memory' },
        { label: '故事', value: 'story' }
      ]
    }),
    // 父内容，用于回忆和故事关联最爱
    parent: relationship({ ref: 'Post', many: true }),
    config: json()
    // We also link posts to tags. This is a many <=> many linking.
    // 文章的标签关联，这是一个 many <=> many 关联
    // tags: relationship({
    //   ref: 'Tag.posts',
    //   ui: {
    //     displayMode: 'cards',
    //     cardFields: ['name'],
    //     inlineEdit: { fields: ['name'] },
    //     linkToItem: true,
    //     inlineConnect: true,
    //     inlineCreate: { fields: ['name'] }
    //   },
    //   many: true
    // })
  }
});
