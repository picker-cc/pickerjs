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
var CaixieAppPlugin_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaixieAppPlugin = void 0;
const express_1 = __importDefault(require("express"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const core_1 = require("@pickerjs/core");
const env_1 = require("./utils/env");
const resolve_path_1 = require("./utils/resolve-path");
const get_vite_server_1 = require("./get-vite-server");
const vite_plugin_ssr_1 = require("vite-plugin-ssr");
const users_service_1 = require("./users/users.service");
const users_controller_1 = require("./users/users.controller");
const scraper_resolver_1 = require("./scraper/scraper.resolver");
const scraper_service_1 = require("./scraper/scraper.service");
let CaixieAppPlugin = CaixieAppPlugin_1 = class CaixieAppPlugin {
    constructor(configService, processContext) {
        this.configService = configService;
        this.processContext = processContext;
    }
    static init(options) {
        this.options = options;
        return CaixieAppPlugin_1;
    }
    async configure(consumer) {
        const { route } = CaixieAppPlugin_1.options;
        if (this.processContext.isWorker) {
            return;
        }
        const appUiServer = express_1.default.Router();
        const TEMPLATE_PLACEHOLDER = '<!-- template-placeholder -->';
        if (env_1.isProduction) {
            appUiServer.use(express_1.default.static((0, resolve_path_1.resolveDistPath)('client')));
        }
        else {
            const vite = await (0, get_vite_server_1.getViteServer)();
            consumer.apply(vite.middlewares, async (req, res, next) => {
                const pageContextInit = {
                    urlOriginal: req.originalUrl,
                    pageProps: {
                        hello: 'mypassword',
                    }
                };
                const pageContext = await (0, vite_plugin_ssr_1.renderPage)(pageContextInit);
                const { httpResponse } = pageContext;
                if (!httpResponse)
                    return next();
                const { body, statusCode, contentType } = httpResponse;
                res.status(statusCode).type(contentType).send(body);
            }).forRoutes(route);
        }
    }
};
CaixieAppPlugin = CaixieAppPlugin_1 = __decorate([
    (0, core_1.PickerPlugin)({
        imports: [
            core_1.PluginCommonModule,
        ],
        providers: [
            users_service_1.UsersService,
            scraper_service_1.ScraperService,
        ],
        controllers: [
            users_controller_1.UsersController
        ],
        apiExtensions: {
            schema: (0, graphql_tag_1.default) `
            type Metadata {
                author: String
                date: String
                description: String
                image: String
                publisher: String
                title: String
                url: String
            }
            extend type Query {
                "查询网站的 meta 信息"
                scraperMeta(url: String): Metadata
            }
        `,
            resolvers: [scraper_resolver_1.ScraperResolver]
        }
    }),
    __metadata("design:paramtypes", [core_1.ConfigService, core_1.ProcessContext])
], CaixieAppPlugin);
exports.CaixieAppPlugin = CaixieAppPlugin;
//# sourceMappingURL=plugin.js.map
