import { inject } from '../node_modules/vue'
import type { App, InjectionKey } from '../node_modules/vue'
import { PageContext } from './types'

export { usePageContext }
export { setPageContext }

const key: InjectionKey<PageContext> = Symbol()

function usePageContext() {
    const pageContext = inject(key)
    if (!pageContext) throw new Error('setPageContext() not called in parent')
    return pageContext
}

function setPageContext(app: App, pageContext: PageContext) {
    app.provide(key, pageContext)
}
