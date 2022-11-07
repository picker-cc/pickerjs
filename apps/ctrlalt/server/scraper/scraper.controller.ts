import {Controller, Get, Query, Res} from "@nestjs/common";
import {Response} from 'express';
import got from "got";
import {ScraperService} from "../scraper/scraper.service";
// const got = require('got')
// const metascraper = require('metascraper')([
//     require('metascraper-author')(),
//     require('metascraper-date')(),
//     require('metascraper-description')(),
//     require('metascraper-image')(),
//     require('metascraper-logo')(),
//     require('metascraper-clearbit')(),
//     require('metascraper-publisher')(),
//     require('metascraper-title')(),
//     require('metascraper-url')()
// ])

// @ts-ignore
// import createBrowserless = require('browserless')
// const browserless = require('browserless')()

// const getHTML = require('html-get')

@Controller('metascraper')
export class MetascraperController {
    constructor(
        private readonly scraperService: ScraperService
    ) {

    }

    @Get()
    async getMetaData(
        @Query('url') url: string,
        @Res() res: Response
    ) {
        const {body: html, url: uri} = await got(url as string);

        const result = await this.scraperService.scrapeMetadata(url, html)
        console.log(result)
        return res.json(result)
        // const res = await t
        // console.log(url)
        // const browserlessFactory = createBrowserless()

        // create a browser context inside Chromium process
        // const browserContext = browserlessFactory.createContext()
        // const getBrowserless = () => browserContext
        // const html = await getHTML(url, { getBrowserless })
        // console.log(result)
        // close the browser context after it's used
        // const metadata = await metascraper({
        //     html,
        //     url
        // })
        // console.log(metadata)
        // @ts-ignore
        // await getBrowserless((browser) => browser.destroyContext())
        // res.set({
        //     'Content-Type': 'text'
        // })
        // const {metadata} = await this.getContent(url)
        // res.send({ metadata: formatMetadata((metadata))})
        // return result.html
        // console.log('fetch ....')
        // this.getContent('https://microlink.io')
        //     .then(metascraper)
        //     .then(metadata => {
        //         console.log(metadata)
        //         // return res.send({
        //         //     metadata: formatMetadata(metadata)
        //         // })
        //     })
        //     .then(browserless.close)
        // const result = await this.getContent(url)
        // console.log(result)
        // const {body: html, url: uri} = await got(url as string);
        // const {html} = await this.getContent(url)
        // const metadata = await metascraper({html, url: uri})
        // console.log(metadata)
        // return res.send({metadata: formatMetadata(metadata)})
        // return
        // console.log(data)
    }

    // async getContent(url: string) {
    //     const browserContext = browserless.createContext()
    //     const promise = getHTML(url, { getBrowserless: () => browserContext })
    // close browser resources before return the result
    // promise.then(() => browserContext).then((browser: any) => browser.destroyContext())
    // return promise
    // }
}

export type TLinkMetadata = {
    author?: string;
    date?: string;
    description?: string;
    image?: string;
    logo?: string;
    publisher?: string;
    title?: string;
    url?: string;
};

// const getContent = async
function formatMetadata(
    metadata: TLinkMetadata
): {
    author: string;
    date: string;
    description: string;
    image: string;
    logo: string;
    publisher: string;
    title: string;
    url: string;
} {
    return {
        author: metadata.author || "",
        date: metadata.date || "",
        description: metadata.description || "",
        image: metadata.image || "",
        logo: metadata.logo || "",
        publisher: metadata.publisher || "",
        title: metadata.title || "",
        url: metadata.url || "",
    };
}