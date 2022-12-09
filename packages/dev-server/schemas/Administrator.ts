import { allowAll, list, relationship, text, timestamp } from '@pickerjs/core';
import { trackingFields } from './utils';

export const Administrator = list({
  // access: {},
  // ui: {}
  access: allowAll,
  fields: {
    name: text({
      validation: {
        isRequired: true
      }
    }),
    emailAddress: text({
      isIndexed: 'unique',
      validation: {
        isRequired: true
      }
    }),
    deletedAt: timestamp({
      defaultValue: { kind: 'now' }
    }),
    // featured:
    ...trackingFields,
    user: relationship({
      ref: 'User.administrator'
    })
  }
});
