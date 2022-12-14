import { TargetType } from "./target-type.enum";
export declare class OutputTarget {
    name?: string;
    description?: string;
    cssSelector: string;
    attribute?: string;
    type: TargetType;
    multiple: boolean;
    values: Array<string | number | null>;
}
