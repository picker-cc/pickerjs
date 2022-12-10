import {
  allOperations,
  json,
  list,
  relationship,
  select,
  text,
  timestamp,
} from '@pickerjs/core';
import slugify from 'limax';
import { nanoid } from 'nanoid';
import { WeChatService } from '@pickerjs/wechat-plugin';
import { trackingFields } from '../utils';
import { access } from '../auth-and-access-control';
// import dayjs from "dayjs";
// import { nanoid } from 'nanoid'

// const id = nanoid();
export const Post = list({
  access: {
    operation: {
      ...allOperations(access.isUser)
      // update: access.isUser,
      // create: access.isUser,
      // delete: access.isUser
    },
    item: {
      // create: access.isSelf,
      update: access.isSelf,
      delete: access.isSelf
    }
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, inputData, item }) => {
      console.log('resolveInput');

      if (item) {
        return resolvedData;
      }
      const { slug, title, type, parent } = resolvedData;
      // 如果 id 就是更新操作
      // if (resolvedData.id) {
      //   return resolvedData
      // }
      // 如果类别为回忆和故事，就会包含 parent
      if (resolvedData.type === 'MEMORY' || resolvedData.type === 'STORY') {
        const findParent = await context.query.Post.findOne({
          where: {
            id: resolvedData.parent.connect.id
          },
          query: `title`
        });

        const genId = nanoid(8);
        resolvedData.title = `${findParent.title}-${resolvedData.type}-${genId}`;
        resolvedData.slug = `${resolvedData.type}-${genId}`;
      }
      if (resolvedData.id) {
        return resolvedData;
      }
      if (!resolvedData.slug) {
        resolvedData.slug = slugify(resolvedData.title);
      }

      return resolvedData;
    },

    validateInput: async ({ resolvedData, addValidationError, context, inputData, item }) => {
      console.log('validate input');
      const wechatService = context.injector!.get(WeChatService);
      const { access_token, errcode } = await wechatService.getAccountAccessToken();
      if (errcode) {
        addValidationError('微信token验证错误');
      }

      const findUser = await context.query.User.findOne({
        where: {
          id: context.session.itemId
        },
        query: `id identifier wechat{ openId }`
      });
      if (!findUser) {
        resolvedData.user = null;
        resolvedData.favorites = null;
        addValidationError('用户未找到');
      }
      // console.log(context.session.itemId)
      if (inputData.featured && inputData.featured.connect) {
        const findAsset = await context.query.Asset.findOne({
          where: {
            id: inputData.featured.connect.id
          },
          query: `id source`
        });
        if (!findAsset) {
          addValidationError('资源未找到');
        }
        const staticUrl = 'https://favorite-static.caixie.top/';
        // 验证图片
        const { data } = await wechatService.mp.mediaSecCheck(
          {
            media_url: `${staticUrl}${findAsset.source}`,
            media_type: 2,
            version: 2,
            openid: findUser.wechat.openId,
            scene: 1
          },
          access_token
        );
        if (data.trace_id) {
          await context.db.Asset.updateOne({
            where: {
              id: findAsset.id
            },
            data: {
              traceId: data.trace_id
            }
          });
        }
        return;
      }
      if (!resolvedData.title || resolvedData.title === '') {
        addValidationError('标题不能为空');
      }
      const posts = await context.db.Post.findMany({
        where: {
          OR: [
            {
              title: { equals: resolvedData.title },
              slug: { equals: resolvedData.slug }
            }
          ]
        }
      });
      if (posts.length > 0) {
        addValidationError('标题不能重复');
      }
      // console.log(ret)
      // {
      //   access_token: '63_2CnO1nuyrX-LXdyWO7gmHlxrQRuXh9PMJkpvpo-vYrmaDqK3LOLIyC27s9ICeNuXEu4KoLS_ucE6eujmchUQZUiJMq2XeMZy02Wm87WEUvTBJJk1ghlE3SEqCtwZTAjAIACWD',
      //     expires_in: 1669607590
      // }

      // if (item!.userId) {
      //   const id: string = item!.userId.toString()

      // console.log(findUser.)
      // try {
      const { data } = await context.injector!.get(WeChatService).mp.msgSecCheck(
        {
          version: 2,
          openid: findUser.wechat.openId,
          scene: 1,
          content: `${resolvedData.title ? resolvedData.title : ''}${resolvedData.content ? resolvedData.content : ''}`
        },
        access_token
      );
      // console.log(JSON.stringify(data))
      // console.log(data.result)
      // console.log(data)
      if (data.result.suggest !== 'pass') {
        // reset()
        addValidationError('该内容未通过审核，请重新提交');
      }
      // } catch (err) {
      //   reset()
      //   addValidationError('内容安全审查接口异常，请重试。')
      //   console.log(err)
      // }
      // console.log(data)
      // data.user.identifier
      // data.user.wechat.openId
      // const { data } = await context.injector!.get(WeChatService).mp.msgSecCheck();

      // }
      // console.log(item.id)
      // const { data } = await context.injector!.get(WeChatService).mp.msgSecCheck();
    }
    // afterOperation: async ({
    //   operation,
    //   item, inputData, resolvedData,
    //   context
    // }) => {
    //   if (operation === 'create') {
    //     if (item && item.id) {
    //       console.log(item)
    //       await context.db.UserFavorite.createOne({
    //         data: {
    //           user: {
    //             connect: {
    //               id: item.userId
    //             }
    //           },
    //           post: {},
    //         }
    //       })
    //     }
    //   }
    // }
  },
  fields: {
    slug: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true
      }
    }),
    title: text({}),
    // 状态字段，用于控制是否显示内容
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
    content: text({
      db: {
        nativeType: 'Text',
        isNullable: true
      }
    }),
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
      },
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          // Default to the currently logged in user on create.
          if (operation === 'create' && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session?.itemId } };
          }
          if (operation === 'update' && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session?.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    favorites: relationship({
      ref: 'UserFavorite.post',
      many: true
    }),
    // meta: json(),
    // style: json(),
    type: select({
      type: 'enum',
      options: [
        { label: '最爱', value: 'FAVORITE' },
        { label: '回忆', value: 'MEMORY' },
        { label: '故事', value: 'STORY' }
      ],
      defaultValue: 'FAVORITE'
    }),
    // 父内容，用于回忆和故事关联最爱
    parent: relationship({ ref: 'Post' }),
    config: json(),
    // We also link posts to tags. This is a many <=> many linking.
    // 文章的标签关联，这是一个 many <=> many 关联
    tags: relationship({
      ref: 'Tag.posts',
      ui: {
        displayMode: 'cards',
        cardFields: ['name'],
        inlineEdit: { fields: ['name'] },
        linkToItem: true,
        inlineConnect: true,
        inlineCreate: { fields: ['name'] }
      },
      many: true
    }),
    ...trackingFields,
    featured: relationship({ ref: 'Asset.posts' })
    // children: virtual({
    //   field: graphql.field({
    //     type: graphql.
    //   })
    // })
  }
});
