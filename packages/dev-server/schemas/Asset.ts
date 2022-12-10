import { allowAll, integer, json, list, relationship, select, text } from '@pickerjs/core';
import { trackingFields } from '../utils';

export const Asset = list({
  access: allowAll,
  description: '',
  fields: {
    name: text(),
    title: text(),
    type: select({
      type: 'enum',
      options: [
        {
          label: '文件',
          value: 'BINARY'
        },
        {
          label: '图片',
          value: 'IMAGE'
        },
        {
          label: '视频',
          value: 'VIDEO'
        },
        {
          label: '音频',
          value: 'AUDIO'
        }
      ]
      // defaultValue: 'image'
    }),
    status: select({
      type: 'enum',
      options: [
        { label: '已批准', value: 'APPROVED' },
        { label: '审核中', value: 'PENDING' },
        { label: '垃圾内容', value: 'SPAM' },
        { label: '已删除', value: 'TRASH' }
      ],
      // 我们希望确保新的文章内容在创建时是以草稿的状态开始的
      defaultValue: 'PENDING',
      // 配置字段在 Admin UI 中的交互外观
      ui: {
        displayMode: 'segmented-control'
      }
    }),

    mimeType: text(),
    width: integer({
      defaultValue: 0
    }),
    height: integer({
      defaultValue: 0
    }),
    fileSize: integer(),
    // source: text(),
    // preview: text(),
    source: text(),
    preview: text(),
    // {x: number; y: number}
    focalPoint: json(),
    tags: relationship({
      ref: 'Tag.assets',
      many: true
    }),
    ...trackingFields,
    traceId: text({
      isIndexed: 'unique',
      db: {
        isNullable: true
      }
    }),
    posts: relationship({ ref: 'Post.featured', many: true })
  }
});
