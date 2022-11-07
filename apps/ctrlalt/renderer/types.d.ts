export type { PageContextServer };
export type { PageContextClient };
export type { PageContext };
export type { PageProps };
import type { PageContextBuiltIn } from '../node_modules/vite-plugin-ssr';
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client';
import type { ComponentPublicInstance } from '../node_modules/vue';
declare type Page = ComponentPublicInstance;
declare type PageProps = {};
export declare type PageContextCustom = {
    Page: Page;
    pageProps?: PageProps;
    urlPathname: string;
    exports: {
        documentProps?: {
            title?: string;
            description?: string;
        };
    };
};
declare type PageContextServer = PageContextBuiltIn<Page> & PageContextCustom;
declare type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom;
declare type PageContext = PageContextClient | PageContextServer;
