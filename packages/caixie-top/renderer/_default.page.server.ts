import {renderToString} from '@vue/server-renderer'
import {escapeInject, dangerouslySkipEscape} from '../node_modules/vite-plugin-ssr'
import {createApp} from './app'
import logoUrl from './logo.svg'
import type {PageContextServer} from './types'
import {setup} from '@css-render/vue3-ssr'

export {render}
export {onBeforeRender}
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'urlPathname']

async function render(pageContext: PageContextServer): Promise<any> {
    const app = createApp(pageContext)
    const {collect} = setup(app)// 必需在 renderToString 之前初始化，否则会出现服务端无法找到Document的问题

    const appHtml = await renderToString(app)
    const cssHtml = collect()
    // See https://vite-plugin-ssr.com/head
    const {documentProps} = pageContext.exports
    const title = (documentProps && documentProps.title) || 'Vite SSR app'
    const desc = (documentProps && documentProps.description) || 'App using Vite + vite-plugin-ssr'

    const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <title>${title}</title>
        ${dangerouslySkipEscape(cssHtml)}
      </head>
      <body>
        <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      </body>

    </html>`

    // console.log(pageContext.pageProps)
    return {
        documentHtml,
        pageContext: {
            // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
        }
    }
}

async function onBeforeRender(pageContext) {
    // console.log('on before render')
    // return {
    //     pageContext: {
    //         hello: 'world'
    //     }
    // }
    // console.log(pageContext)
    // const { app, store } = createApp(pageContext)
    //
    // const stream = renderToNodeStream(app)
    //
    // const initialStoreState = store.state.value
    //
    // return {
    //     pageContext: {
    //         initialStoreState,
    //         stream
    //     }
    // }
}
