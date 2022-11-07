import {PickerEvent, RequestContext} from "@picker-cc/core";

export class WechatEvent extends PickerEvent {
    constructor(
        public ctx: RequestContext,
        public type: 'action'
    ) {
        super()
    }

}
