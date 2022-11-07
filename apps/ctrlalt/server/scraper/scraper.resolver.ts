import {Args, Query, Resolver} from "@nestjs/graphql";
import {ScraperService} from "./scraper.service";
import {Ctx, RequestContext} from "@picker-cc/core";
import {Metadata} from "metascraper";
import got from "got";

@Resolver('ScraperResolver')
export class ScraperResolver {
    constructor(
        private readonly scraperService: ScraperService
    ) {
    }

    @Query()
    async scraperMeta(
        @Ctx() ctx: RequestContext,
        @Args() args: any
    ): Promise<Metadata> {
        const {body: html, url: uri} = await got(args.url);

        return this.scraperService.scrapeMetadata(uri, html)
    }
}