import { TargetType } from "./target-type.enum";
export declare class InputTarget {
    name?: string;
    description?: string;
    cssSelector: string;
    attribute?: string;
    type?: TargetType;
    multiple?: boolean;
}
