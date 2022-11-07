import {PickerEvent} from "@pickerjs/core";

export class SmsEvent extends PickerEvent {
    constructor(
        public type: 'verification' | 'content',
        public phone: string,
        public content: string,
    ) {
        super()
    }

}
