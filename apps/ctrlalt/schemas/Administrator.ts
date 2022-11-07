import {trackingFields} from "./utils";
import {list, relationship, text, timestamp} from "@picker-cc/core";

export const Administrator = list({
    // access: {},
    // ui: {}
    fields: {
        name: text({
            validation: {
                isRequired: true
            },
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
})
