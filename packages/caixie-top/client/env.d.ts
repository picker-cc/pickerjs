/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from '../node_modules/vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
