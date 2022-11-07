import type { PageContextServer } from './types';
export { render };
export { onBeforeRender };
export declare const passToClient: string[];
declare function render(pageContext: PageContextServer): Promise<any>;
declare function onBeforeRender(pageContext: any): Promise<void>;
