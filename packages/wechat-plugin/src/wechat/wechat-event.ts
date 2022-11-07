import {PickerEvent, RequestContext} from "@pickerjs/core";

export class WechatEvent extends PickerEvent {
    constructor(
        public ctx: RequestContext,
        public type: 'action'
    ) {
        super()
    }

}
