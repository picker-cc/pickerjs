import { allowAll, list, relationship, text } from '@pickerjs/core';

export const Tag = list({
  access: allowAll,
  fields: {
    name: text(),
    posts: relationship({ref: 'Post.tags', many: true}),
    assets: relationship({ref: 'Asset.tags', many: true})
  },
})
