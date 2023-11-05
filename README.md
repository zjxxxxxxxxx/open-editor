<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor">
      <img width="120px" src="./public/logo.png" alt="Open Editor" />
      <h1 align="center">Open Editor</h1>
  </a>
</p>
</br>
<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor/actions/workflows/ci.yml">
    <img src="https://github.com/zjxxxxxxxxx/open-editor/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/license/zjxxxxxxxxx/open-editor" alt="MIT">
  </a>
</p>
<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>
</br>

A web devtools for fast find source code.

Whether in `React` or `Vue`, you can achieve exactly the same effect, whether you are a `React` developer, a `Vue` developer, or a `React`, `Vue` dual Developers, this development tool is very suitable for you. It can save you a lot of time looking for codes, allowing you to focus more on writing code.

![image](./public/demo.gif)

> Valid only during development, requires Node.js version 14+.

## Features

- 🌈 Support `React`、`Nextjs`、`Vue`。
- 🔥 Support `Rollup`、`Vite`、`Webpack`。
- 🕹️ Support combined shortcut keys.
- 🎯 Support precise positioning of rows and columns.
- 🚀 Support find component tree.
- 👽 Support automatically find available editors.

## Packages

| Source code                                                                                     | NPM version                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [`@open-editor/rollup`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/rollup)   | [![NPM version](https://img.shields.io/npm/v/@open-editor/rollup?color=)](https://www.npmjs.com/package/@open-editor/rollup)   |
| [`@open-editor/vite`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/vite)       | [![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)       |
| [`@open-editor/webpack`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/webpack) | [![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack) |

## Usage

> The example uses [`vite/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react) as a reference. In other cases, the only choice is different, and the usage is exactly the same.

### Use plugin

First you need to install the plugin.

```bash
npm -D i @open-editor/vite
```

Then add the plugin to the build configuration.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import OpenEditor from '@open-editor/vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        retainLines: true,
      },
    }),
    OpenEditor({
      displayToggle: true,
    }),
  ],
});
```

That concludes the code section.

### Enable inspector

First you need to get the project running.

```bash
npm run dev
```

Then open the local server address of the project in the browser. At this time, you can see a button appearing in the upper right corner of the browser. This button can be used to switch the enabled state of the Element Inspector.

<img width="500" src="./public/toggle-button-demo.png" alt="toggle button demo"/>

Clicking (shortcut key: ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>) will enable the inspector. We move the mouse to the point where we need to inspect Source code information can be seen on the element.

<img width="500" src="./public/inspect-element-demo.png" alt="inspect element demo"/>

At this time, click element to automatically open the location of the source code in the editor.

<img width="500" src="./public/open-editor-demo.png" alt="open editor demo"/>

At this time, you can also choose not to click on the element, but long press (shortcut key: ⌨️ <kbd>command ⌘</kbd> + 🖱 click) the element to view the complete component tree information.

<img width="500" src="./public/open-tree-demo.png" alt="open editor demo"/>

Then click on the leaf node, and the location of the leaf node will automatically open in the editor.

<img width="500" src="./public/open-editor-demo.png" alt="open editor demo"/>

### Exit inspector

Click again (shortcut key 1: ⌨️ <kbd>Options⌥</kbd> + <kbd>Command⌘</kbd> + <kbd>O</kbd>, shortcut key 2: ⌨️ <kbd>esc</kbd> , shortcut key 3: 🖱right click) button in the upper right corner of the browser will exit the inspector.

<img width="500" src="./public/toggle-button-demo.png" alt="toggle button demo"/>

## Frameworks

### React

> Requires React version 15+.

`open-editor` needs to be used with [`@babel/plugin-transform-react-jsx-source`](https://babeljs.io/docs/babel-plugin-transform-react-jsx-source), which It is a plug-in that obtains source code row and column information. Normally you don't need to pay attention to this thing because it is mainly built into the scaffolding tools. If you have issues with `open-editor` not being able to open source code, this would be a way to troubleshoot the issue.

### Vue

> Requires Vue version 2+.

`open-editor` needs to be used with [`unplugin-vue-source`](https://github.com/zjxxxxxxxxx/unplugin-vue-source), which is a plugin for getting source code row and column information , if this plug-in is missing, the source code file will only be opened in the editor, and there will be no way to accurately locate the rows and columns of the source code.

## Playgrounds

| Source code                                                                                        | Online trial                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`rollup/react15`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-react15) | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-react15) |
| [`rollup/vue2`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-vue2)       | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-vue2)    |
| [`vite/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react)         | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react)     |
| [`vite/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue)             | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue)       |
| [`webpack/nextjs`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next)   | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next)   |
| [`webpack/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)       | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)    |

## Thanks

- [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)
- [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector)
