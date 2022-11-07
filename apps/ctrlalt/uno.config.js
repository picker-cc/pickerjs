import { presetCore, presetThemeDefault } from './node_modules/anu-vue'
import {
    defineConfig,
    presetIcons,
    presetUno,
} from './node_modules/unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetIcons({
            scale: 1.2,
            extraProperties: {
                height: '1.5em',
                'flex-shrink': '0',
                'display': 'inline-block',
            },
        }),

        // anu-vue presets
        presetCore(),
        presetThemeDefault(),
    ],
    include: [/.*\/anu-vue\.js(.*)?$/, './**/*.vue', './**/*.md'],
})
