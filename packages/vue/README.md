# @open-editor/vue

Add a \_debugSource prop to all Elements

- 🌈 Supports `Vue2`, `Vue3`, `Nuxt`.
- 🪐 Support add to `<Component/>`.
- ✨ JSX support in `.vue`, `.jsx`, `.tsx`.
- 😃 Supports `Vite`, `Webpack`, `Vue CLI`, `Rollup`.

> For development only

---

## SFC

before

```html
<!-- src/App.vue -->
<template>
  <div>hello word</div>
</template>
```

after

```html
<!-- src/App.vue -->
<template>
  <div :_debugSource='{ "file": "src/App.vue", "line": 3, "column": 3 }'>hello word</div>
</template>
```

---

## JSX

before

```tsx
// src/App.tsx
export default function App() {
  return <div>hello word</div>;
}
```

after

```tsx
// src/App.tsx
export default function App() {
  return <div _debugSource={{ file: 'src/App.tsx', line: 3, column: 9 }}>hello word</div>;
}
```

## Install

```bash
npm i @open-editor/vue -D
```

## Plugins

You need to make sure that `openEditorVue` is executed before vue compiles the plugin for execution

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import openEditorVue from '@open-editor/vue/vite';

export default defineConfig({
  plugins: [
    openEditorVue({
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
import openEditorVue from '@open-editor/vue/rollup';

export default {
  plugins: [
    openEditorVue({
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
    require('@open-editor/vue/webpack')({
      /* options */
    }),
    // other plugins
  ],
};
```

compatible with rspack.

```ts
// rspack.config.js
module.exports = {
  plugins: [
    require('@open-editor/vue/webpack')({
      /* options */
    }),
    // other plugins
  ],
};
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
import openEditorVue from '@open-editor/vue/vite';

export default defineNuxtConfig({
  vite: {
    plugins: [
      openEditorVue({
        /* options */
      }),
      // other plugins
    ],
  },
});
```

<br></details>

## Configuration

The following show the default values of the configuration

```ts
export interface Options {
  /**
   * 源码根路径 | Source root path
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * 是否生成 sourceMap | Generate sourceMap
   * @default false
   */
  sourceMap?: boolean;
  /**
   * 包含的文件 | Files to include
   * @default /\.(vue|jsx|tsx)$/
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * 排除的文件 | Files to exclude
   * @default /\/node_modules\//
   */
  exclude?: string | RegExp | (string | RegExp)[];
}
```
