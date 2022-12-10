import { allOperations, list, relationship, text } from '@pickerjs/core';
import dayjs from 'dayjs';
import { trackingFields } from '../utils';
import { access } from '../auth-and-access-control';

export const UserFavorite = list({
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
  fields: {
    user: relationship({ ref: 'User.favorites' }),
    post: relationship({ ref: 'Post.favorites' }),
    ip: text({
      db: {
        isNullable: true
      }
    }),
    date: text({
      defaultValue: dayjs(new Date()).format('YYYY-MM-DD')
    }),
    ...trackingFields
  }
});
