import { Metadata } from "metascraper";
import { Picker, ProcessContext } from "@pickerjs/core";
export declare class ScraperService {
    private processContext;
    private picker;
    constructor(processContext: ProcessContext, picker: Picker);
    private readonly metaScraper;
    scrapeMetadata(url: string, html: string): Promise<Metadata>;
    private scrapeTargets;
    private scrapeElement;
    private parseRawValue;
    print(): void;
}
