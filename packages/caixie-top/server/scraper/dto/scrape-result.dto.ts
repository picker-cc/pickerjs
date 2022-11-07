import { Metadata } from "metascraper"
import { OutputTarget } from "../types/output-target.class"

export class ScrapeResultDto {
    targets: OutputTarget[]

    metadata?: Metadata
}