import {
  createRouter as _createRouter,
  createMemoryHistory,
  createWebHistory,
} from '../../node_modules/vue-router';

// @ts-ignore
const pages = import.meta.glob('../pages/*.vue');
console.log(pages)
const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\.\/pages\/(.*)\.vue$/)[1].toLowerCase();
  console.log(name)
    console.log(pages[path])
  const routePath = `/${name}`;
  if (routePath === '/admin') {
    return {
      path: '/admin',
      name,
      component: pages[path],
    };
  }
  return {
    path: routePath,
    name,
    component: pages[path],
  };
});

export function createRouter() {
  return _createRouter({
    // @ts-ignore
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  });
}
