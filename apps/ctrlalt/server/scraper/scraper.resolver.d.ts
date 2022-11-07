import { ScraperService } from "./scraper.service";
import { RequestContext } from "@pickerjs/core";
import { Metadata } from "metascraper";
export declare class ScraperResolver {
    private readonly scraperService;
    constructor(scraperService: ScraperService);
    scraperMeta(ctx: RequestContext, args: any): Promise<Metadata>;
}
