import metaScraper, { Metadata } from "metascraper"
import { JSDOM } from "jsdom"

import metaAudio from "metascraper-audio"
import metaAuthor from "metascraper-author"
import metaDate from "metascraper-date"
import metaDescription from "metascraper-description"
import metaIframe from "metascraper-iframe"
import metaImage from "metascraper-image"
import metaLang from "metascraper-lang"
import metaLogo from "metascraper-logo"
import metaLogoFavicon from "metascraper-logo-favicon"
import metaPublisher from "metascraper-publisher"
import metaReadability from "metascraper-readability"
import metaTitle from "metascraper-title"
import metaUrl from "metascraper-url"
import metaVideo from "metascraper-video"
import {TargetType} from "./types/target-type.enum";
import {InputTarget} from "./types/input-target.class";
import {OutputTarget} from "./types/output-target.class";
import {Injectable} from "@nestjs/common";
// import {Picker} from "@picker-cc/core/src/picker-context/picker-context";
import {Picker, ProcessContext} from "@picker-cc/core";
import { Context } from '.picker/types';

@Injectable()
export class ScraperService {
    constructor(
        private processContext: ProcessContext,
        private picker: Picker
    ) {
    }

    private readonly metaScraper = metaScraper([
        metaAudio(),
        metaAuthor(),
        metaDate(),
        metaDescription(),
        metaIframe(),
        metaImage(),
        metaLang(),
        metaLogo(),
        metaLogoFavicon(),
        metaPublisher(),
        metaReadability(),
        metaTitle(),
        metaUrl(),
        metaVideo(),
    ])

    // async scrapeWithHtml(
    //     url: string,
    //     metadata: boolean,
    //     html: string
    // ): Promise<any> {
    //     const meta = metadata ? await this.scrapeMetadata(url, html) : undefined
    //     return {
    //         metadata: meta
    //     }
    //     // return {metadata: }
    // }
    async scrapeMetadata(url: string, html: string): Promise<Metadata> {
        // this.picker.picker.query
        // this.picker.picker
        // this.picker.context.
        // this.picker.context.bookmark.query.
        const context: Context = this.picker.context as Context
        // const users = await context.query.User.findMany({
        //     query: `
        //         id
        //         name
        //         detail
        //     `
        // })
        const users = context.db.User.findMany()
        console.log(users)
        return this.metaScraper({ url, html })
    }

    private scrapeTargets(targets: InputTarget[], html: string): OutputTarget[] {
        const dom = new JSDOM(html)
        const { document } = dom.window

        return targets.map((target) => {
            const {
                name,
                description,
                cssSelector,
                attribute,
                type = TargetType.String,
                multiple = false,
            } = target

            let elements = Array.from(document.querySelectorAll(cssSelector))
            if (!multiple) {
                elements = elements.slice(0, 1)
            }
            const values = elements.map((element) => {
                return this.scrapeElement(element, type, attribute)
            })
            return { name, description, cssSelector, attribute, type, multiple, values }
        })
    }

    private scrapeElement(element: Element, type: TargetType, attribute?: string) {
        const rawValue = attribute
            ? element.getAttribute(attribute)
            : type === TargetType.Html
                ? element.innerHTML
                : element.textContent
        return this.parseRawValue(rawValue, type)
    }

    private parseRawValue(
        rawValue: string | null,
        type: TargetType
    ): string | number | null {
        if (rawValue === null) {
            return null
        }
        if (type === TargetType.Number) {
            return parseFloat(rawValue)
        }
        return rawValue.trim()
    }

    print() {
        console.log('I am Scraper!')
    }

}
