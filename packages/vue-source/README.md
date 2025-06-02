# @open-editor/vue-source

Add a \_\_source prop to all Elements.

- 🌈 Supports `Vue2` and `Vue3`.
- 🪐 Support add to `<Component/>`.
- ✨ JSX support in `.vue`, `.jsx`, `.tsx`.
- 😃 Supports `Vite`, `Webpack`, `Rspack`, `Vue CLI`, `Rollup`, `esbuild`.

> For development only

---

sfc without

```html
<!-- src/App.vue -->
<template>
  <div>hello word</div>
</template>
```

with

```html
<!-- src/App.vue -->
<template>
  <div data-debug-source="src/App.vue:3:3">hello word</div>
</template>
```

---

jsx without

```tsx
// src/App.tsx
export default function App() {
  return <div>hello word</div>;
}
```

with

```tsx
// src/App.tsx
export default function App() {
  return <div data-debug-source="src/App.tsx:3:9">hello word</div>;
}
```

## Install

```bash
npm i @open-editor/vue-source
```

## Plugins

You need to make sure that `VueSource` is executed before vue compiles the plugin for execution.

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import VueSource from '@open-editor/vue-source/vite';

export default defineConfig({
  plugins: [
    VueSource({
      /* options */
    }),
    // other plugins
  ],
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import VueSource from '@open-editor/vue-source/rollup';

export default {
  plugins: [
    VueSource({
      /* options */
    }),
    // other plugins
  ],
};
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  plugins: [
    require('@open-editor/vue-source/webpack')({
      /* options */
    }),
    // other plugins
  ],
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
module.exports = {
  plugins: [
    require('@open-editor/react-source/rspack')({
      /* options */
    }),
    // other plugins
  ],
};
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('@open-editor/vue-source/webpack')({
        /* options */
      }),
      // other plugins
    ],
  },
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild';
import VueSource from '@open-editor/vue-source/esbuild';

build({
  plugins: [
    VueSource({
      /* options */
    }),
    // other plugins
  ],
});
```

<br></details>

## Configuration

The following show the default values of the configuration

```ts
export interface Options {
  /**
   * source root path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * generate sourceMap
   *
   * @default false
   */
  sourceMap?: boolean;
  /**
   * @default /\.(vue|jsx|tsx|mdx)$/
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * @default /\/node_modules\//
   */
  exclude?: string | RegExp | (string | RegExp)[];
}
```
