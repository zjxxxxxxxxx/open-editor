# @open-editor/react-source

Add a \_\_source prop to all Elements.

- 🌈 Supports `React15+`.
- 🪐 Support add to `<Component/>`.
- ✨ JSX support in `.jsx`, `.tsx`.
- 😃 Supports `Vite`, `Webpack`, `Rspack`, `create-react-app`, `Rollup`, `esbuild`.

> For development only

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
npm i @open-editor/react-source
```

## Plugins

You need to make sure that `ReactSource` is executed before vue compiles the plugin for execution.

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import ReactSource from '@open-editor/react-source/vite';

export default defineConfig({
  plugins: [
    ReactSource({
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
import ReactSource from '@open-editor/react-source/rollup';

export default {
  plugins: [
    ReactSource({
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
    require('@open-editor/react-source/webpack')({
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
      require('@open-editor/react-source/webpack')({
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
import ReactSource from '@open-editor/react-source/esbuild';

build({
  plugins: [
    ReactSource({
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
