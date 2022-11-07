import type { App } from '../node_modules/vue';
import { PageContext } from './types';
export { usePageContext };
export { setPageContext };
declare function usePageContext(): PageContext;
declare function setPageContext(app: App, pageContext: PageContext): void;
