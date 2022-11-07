import {PickerEvent} from "@picker-cc/core";

export class SmsEvent extends PickerEvent {
    constructor(
        public type: 'verification' | 'content',
        public phone: string,
        public content: string,
    ) {
        super()
    }

}
