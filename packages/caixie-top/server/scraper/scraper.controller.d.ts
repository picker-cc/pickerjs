import { Response } from 'express';
import { ScraperService } from "../scraper/scraper.service";
export declare class MetascraperController {
    private readonly scraperService;
    constructor(scraperService: ScraperService);
    getMetaData(url: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare type TLinkMetadata = {
    author?: string;
    date?: string;
    description?: string;
    image?: string;
    logo?: string;
    publisher?: string;
    title?: string;
    url?: string;
};
