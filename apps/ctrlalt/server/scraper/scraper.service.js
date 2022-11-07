"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const metascraper_1 = __importDefault(require("metascraper"));
const jsdom_1 = require("jsdom");
const metascraper_audio_1 = __importDefault(require("metascraper-audio"));
const metascraper_author_1 = __importDefault(require("metascraper-author"));
const metascraper_date_1 = __importDefault(require("metascraper-date"));
const metascraper_description_1 = __importDefault(require("metascraper-description"));
const metascraper_iframe_1 = __importDefault(require("metascraper-iframe"));
const metascraper_image_1 = __importDefault(require("metascraper-image"));
const metascraper_lang_1 = __importDefault(require("metascraper-lang"));
const metascraper_logo_1 = __importDefault(require("metascraper-logo"));
const metascraper_logo_favicon_1 = __importDefault(require("metascraper-logo-favicon"));
const metascraper_publisher_1 = __importDefault(require("metascraper-publisher"));
const metascraper_readability_1 = __importDefault(require("metascraper-readability"));
const metascraper_title_1 = __importDefault(require("metascraper-title"));
const metascraper_url_1 = __importDefault(require("metascraper-url"));
const metascraper_video_1 = __importDefault(require("metascraper-video"));
const target_type_enum_1 = require("./types/target-type.enum");
const common_1 = require("@nestjs/common");
const core_1 = require("@pickerjs/core");
let ScraperService = class ScraperService {
    constructor(processContext, picker) {
        this.processContext = processContext;
        this.picker = picker;
        this.metaScraper = (0, metascraper_1.default)([
            (0, metascraper_audio_1.default)(),
            (0, metascraper_author_1.default)(),
            (0, metascraper_date_1.default)(),
            (0, metascraper_description_1.default)(),
            (0, metascraper_iframe_1.default)(),
            (0, metascraper_image_1.default)(),
            (0, metascraper_lang_1.default)(),
            (0, metascraper_logo_1.default)(),
            (0, metascraper_logo_favicon_1.default)(),
            (0, metascraper_publisher_1.default)(),
            (0, metascraper_readability_1.default)(),
            (0, metascraper_title_1.default)(),
            (0, metascraper_url_1.default)(),
            (0, metascraper_video_1.default)(),
        ]);
    }
    async scrapeMetadata(url, html) {
        const context = this.picker.context;
        const users = context.db.User.findMany();
        console.log(users);
        return this.metaScraper({ url, html });
    }
    scrapeTargets(targets, html) {
        const dom = new jsdom_1.JSDOM(html);
        const { document } = dom.window;
        return targets.map((target) => {
            const { name, description, cssSelector, attribute, type = target_type_enum_1.TargetType.String, multiple = false, } = target;
            let elements = Array.from(document.querySelectorAll(cssSelector));
            if (!multiple) {
                elements = elements.slice(0, 1);
            }
            const values = elements.map((element) => {
                return this.scrapeElement(element, type, attribute);
            });
            return { name, description, cssSelector, attribute, type, multiple, values };
        });
    }
    scrapeElement(element, type, attribute) {
        const rawValue = attribute
            ? element.getAttribute(attribute)
            : type === target_type_enum_1.TargetType.Html
                ? element.innerHTML
                : element.textContent;
        return this.parseRawValue(rawValue, type);
    }
    parseRawValue(rawValue, type) {
        if (rawValue === null) {
            return null;
        }
        if (type === target_type_enum_1.TargetType.Number) {
            return parseFloat(rawValue);
        }
        return rawValue.trim();
    }
    print() {
        console.log('I am Scraper!');
    }
};
ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ProcessContext,
        core_1.Picker])
], ScraperService);
exports.ScraperService = ScraperService;
//# sourceMappingURL=scraper.service.js.map
