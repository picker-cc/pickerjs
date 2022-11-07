import {createServer} from 'vite';
import {resolveClientPath} from './utils/resolve-path';

import type {ViteDevServer} from 'vite';

let viteDevServer: ViteDevServer;
const root = `${__dirname}/..`
/**
 * get vite server
 * @param opts options
 * @param opts.force create vite server forcibly
 * @returns instance of vite server
 */
export async function getViteServer({force} = {force: false}) {
    if (!viteDevServer || force) {
        viteDevServer = await createServer({
            // root: process.cwd(),
            publicDir: resolveClientPath('public'),
            root,
            logLevel: 'info',
            server: {
                middlewareMode: 'ssr',
            },
        });
    }

    return viteDevServer;
}
