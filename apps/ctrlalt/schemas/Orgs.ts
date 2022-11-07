import {checkbox, list, password, relationship, select, text, timestamp} from "@picker-cc/core";
import {trackingFields} from "./utils";


/**
 * 应用表
 */
export const Apps = list({
    // access: {
    //     operation: {
    //         delete: ({ session }) => session?.data.isAdmin,
    //     }
    // },
    ui: {},
    fields: {
        domain: text({}),
        path: text({}),
        public: text({}),
        lang: text({}),
        type: text({}),
        subdomain: text({})
    }
})
