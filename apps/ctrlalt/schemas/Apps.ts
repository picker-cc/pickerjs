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
        identifier: text(),
        org_id: text({}),
        domain: text({}),
        public: text({}),
        spam: text({}),
        type: text({}),
        path: text({}),
        subdomain: text({}),
    }
})
// INSERT INTO `picker_apps` VALUES ('S11SeYT2W',2,'',1503843393892,1503843393892,1,0,0,0,'podcasts',NULL,NULL);
