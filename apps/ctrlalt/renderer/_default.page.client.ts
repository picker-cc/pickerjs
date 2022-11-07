import { createApp } from './app'
import type { PageContextClient } from './types'
import { anu } from '../node_modules/anu-vue'

// UnoCSS import
import 'uno.css'

// import styles
import 'anu-vue/dist/style.css'
export { render }

async function render(pageContext: PageContextClient) {
    const app = createApp(pageContext)
    // console.log(app)
    app.use(anu)
    app.mount('#app')
}

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
