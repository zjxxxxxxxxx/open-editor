# @open-editor/react

Add a \_debugSource prop to all Elements.

- 🌈 Supports `React15+`, `Nextjs`.
- 🪐 Support add to `<Component/>`.
- ✨ JSX support in `.jsx`, `.tsx`.
- 😃 Supports `Vite`, `Webpack`, `create-react-app`, `Rollup`.

> For development only

---

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
  return <div _debugSource={{ file: 'src/App.vue', line: 3, column: 9 }}>hello word</div>;
}
```

## Install

```bash
npm i @open-editor/react -D
```

## Plugins

You need to make sure that `openEditorReact` is executed before jsx compiles the plugin for execution.

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import openEditorReact from '@open-editor/react/vite';

export default defineConfig({
  plugins: [
    openEditorReact({
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
import openEditorReact from '@open-editor/react/rollup';

export default {
  plugins: [
    openEditorReact({
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
    require('@open-editor/react/webpack')({
      /* options */
    }),
    // other plugins
  ],
};
```

<br></details>

<details>
<summary>Nextjs</summary><br>

```ts
// next.config.js
module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(require('@open-editor/react/webpack')());
    }
    return config;
  },
};
```

<br></details>

## Configuration

The following show the default values of the configuration

```ts
export interface Options {
  /**
   * 源码根路径 | Source root path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * 是否生成 sourceMap | Generate sourceMap
   *
   * @default false
   */
  sourceMap?: boolean;
  /**
   * 包含的文件 | Files to include
   *
   * @default /\.(jsx|tsx)$/
   */
  include?: string | RegExp | (string | RegExp)[];
  /**
   * 排除的文件 | Files to exclude
   *
   * @default /\/node_modules\//
   */
  exclude?: string | RegExp | (string | RegExp)[];
}
```
