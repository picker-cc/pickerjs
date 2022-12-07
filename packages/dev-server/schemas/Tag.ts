import {list, relationship, text} from "@pickerjs/core";

export const Tag = list({
  fields: {
    name: text(),
    posts: relationship({ref: 'Post.tags', many: true}),
    assets: relationship({ref: 'Asset.tags', many: true})
  },
})
