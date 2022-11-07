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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetascraperController = void 0;
const common_1 = require("@nestjs/common");
const got_1 = __importDefault(require("got"));
const scraper_service_1 = require("../scraper/scraper.service");
let MetascraperController = class MetascraperController {
    constructor(scraperService) {
        this.scraperService = scraperService;
    }
    async getMetaData(url, res) {
        const { body: html, url: uri } = await (0, got_1.default)(url);
        const result = await this.scraperService.scrapeMetadata(url, html);
        console.log(result);
        return res.json(result);
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('url')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MetascraperController.prototype, "getMetaData", null);
MetascraperController = __decorate([
    (0, common_1.Controller)('metascraper'),
    __metadata("design:paramtypes", [scraper_service_1.ScraperService])
], MetascraperController);
exports.MetascraperController = MetascraperController;
function formatMetadata(metadata) {
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
//# sourceMappingURL=scraper.controller.js.map