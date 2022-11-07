import { PickerEvent } from "@pickerjs/core";
export declare class SmsEvent extends PickerEvent {
    type: 'verification' | 'content';
    phone: string;
    content: string;
    constructor(type: 'verification' | 'content', phone: string, content: string);
}
