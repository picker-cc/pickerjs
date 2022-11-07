import { InputTarget } from "../types/input-target.class";
export declare class ScrapeCommandDto {
    url: string;
    targets?: InputTarget[];
    metadata?: boolean;
    blockAds?: boolean;
    forwardHeaders?: boolean;
    spoofUserAgent?: boolean;
    httpProxy?: boolean;
}
