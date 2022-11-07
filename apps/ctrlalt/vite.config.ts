import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';
import {defineConfig, UserConfig} from './node_modules/vite';
import vue from '@vitejs/plugin-vue';
// import vueJsx from '@vitejs/plugin-vue-jsx';
import ssr from 'vite-plugin-ssr/plugin'
// export default defineConfig({
//     publicDir: resolve(__dirname, 'client', 'public'),
//     // plugins: [vue(), vueJsx()],
//     plugins: [vue(), ssr()],
//     resolve: {
//         alias: {
//             // @ts-ignore
//             '@': fileURLToPath(new URL('client', import.meta.url)),
//         },
//     },
// });
import Unocss from 'unocss/vite'

const config: UserConfig = {
    base: '/admin',
    resolve: {
        alias: {
            '#root': __dirname
        }
    },
    plugins: [
        vue(),
        ssr({
            includeAssetsImportedByServer: true,
            // prerender: true
        }),
        Unocss(),
    ]
}

export default config
