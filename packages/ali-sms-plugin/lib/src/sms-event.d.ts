import { PickerEvent } from "@picker-cc/core";
export declare class SmsEvent extends PickerEvent {
    type: 'verification' | 'content';
    phone: string;
    content: string;
    constructor(type: 'verification' | 'content', phone: string, content: string);
}
