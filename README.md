<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor">
      <img width="120px" src="./public/logo.png" alt="Open Editor" />
      <h1 align="center">Open Editor</h1>
  </a>
</p>
</br>
<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor/actions/workflows/ci.yml">
    <img alt="GitHub Workflow Status (with event)" src="https://img.shields.io/github/actions/workflow/status/zjxxxxxxxxx/open-editor/ci.yml?style=for-the-badge&logo=github&label=CI">
  </a>
  <img alt="GitHub" src="https://img.shields.io/github/license/zjxxxxxxxxx/open-editor?style=for-the-badge">
  </a>
</p>
<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a>
</p>
</br>

## 🔍 Project Overview

Open Editor is an AST-powered debugging tool designed for modern web development. By deeply integrating with build toolchains, it establishes precise two-way mapping between browser elements and source code, enabling developers to directly locate source positions in React/Vue component trees and open corresponding files in local IDEs with one click. This revolutionary solution can save developers over 90%+ of source code locating time, significantly improving debugging efficiency.

[▶▶▶ Live Demo (Vite+React Example)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)  
[![Feature Demo](./public/demo.gif)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)

## 🚀 Core Features

### Framework Support

- **React Ecosystem**: Deep integration with Create React App/Next.js etc.
- **Vue Ecosystem**: Native support for Vue CLI/Nuxt.js/Vite
- **Build Tools**: Full compatibility with Webpack 4+/Vite 2+/Rollup 2+

### Debugging Capabilities

- Multi-level component tree tracing (supports cross-iframe communication)
- Shortcut-driven workflow (⌥⌘O to activate/deactivate inspector)
- Mobile remote debugging support
- Intelligent IDE detection (auto-recognizes locally installed editors)

## 🛠️ Quick Start

### Prerequisites

#### React Projects

```bash
# Verify Babel plugin configuration
npm list @babel/plugin-transform-react-jsx-source
```

> Ensure this plugin is enabled if using custom Babel configurations

#### Vue Projects

```bash
# Install required dependency
npm install unplugin-vue-source -D
```

> Missing this plugin will cause line-column positioning to fail

#### Environment Requirements

> Development environment only  
> Node.js 14+  
> Modern browsers (Chrome 90+/Edge 90+/Firefox 84+)

### Integration Example

> This demo uses [`Vite+React`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react). Other tech stacks only require adjusting corresponding configuration items while maintaining identical core logic.

#### Tool Integration

##### 1. Install Plugin

```bash
npm i @open-editor/vite -D
```

##### 2. Add Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import OpenEditor from '@open-editor/vite';

export default defineConfig({
  plugins: [
    react(),
    OpenEditor({
      // options
    }),
  ],
});
```

##### 3. Start Dev Server

```bash
npm run dev
```

#### Debugging Workflow

##### 1. Activate Inspector

- **Shortcut**: ⌥⌘O (Mac) | Alt+Ctrl+O (Win)
- **Mouse**: Click toggle button in browser's top-right corner

  ###### Toggle Button Demo

  <img src="./public/toggle-button-demo.png" width="500">

##### 2. Element Inspection

- **Hover Preview**: Mouse hover displays source location
- **Precision Navigation**:

  - Single-click to open editor (supports line-column jump)
  - Long-press element (or ⌘+click) to expand component tree

  ###### Hover Preview Demo

  <img src="./public/inspect-element-demo.png" width="500">

  ###### Component Tree Demo

  <img src="./public/open-tree-demo.png" width="500">

##### 3. Deactivate Inspector

- **Shortcut**: Esc or re-trigger ⌥⌘O (Mac) | Alt+Ctrl+O (Win)
- **Mouse**: Click toggle button to exit (or right-click)

## ⚙️ Advanced Features

### Global Events

```ts
// Custom inspector activation logic
window.addEventListener('enableinspector', (e) => {
  e.preventDefault(); // Block default behavior
});

// Custom inspector exit logic
window.addEventListener('exitinspector', (e) => {
  e.preventDefault(); // Block default behavior
});

// Custom editor launch logic
window.addEventListener('openeditor', (e) => {
  const url = new URL(e.detail);
  url.hostname = 'localhost'; // Modify domain
  window.open(url.toString());
  e.preventDefault(); // Block default behavior
});
```

## 🖼 Ecosystem

### Official Plugins

| Documentation                                                                                   | NPM Version                                                                                                                    | Downloads                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [`@open-editor/rollup`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/rollup)   | [![NPM version](https://img.shields.io/npm/v/@open-editor/rollup?color=)](https://www.npmjs.com/package/@open-editor/rollup)   | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/rollup)](https://www.npmjs.com/package/@open-editor/rollup)   |
| [`@open-editor/vite`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/vite)       | [![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)       | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/vite)](https://www.npmjs.com/package/@open-editor/vite)       |
| [`@open-editor/webpack`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/webpack) | [![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack) | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/webpack)](https://www.npmjs.com/package/@open-editor/webpack) |

### Online Playgrounds

| Source Code                                                                                         | Live Demo                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`rollup/react15`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) |
| [`rollup/vue2`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)       | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)    |
| [`vite/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react)         | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react)     |
| [`vite/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-vue)             | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-vue)       |
| [`vite/nuxt`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-nuxt)           | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-nuxt)      |
| [`webpack/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-react)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-react)  |
| [`webpack/nextjs`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-nextjs) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-nextjs) |
| [`webpack/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-vue)       | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-vue)    |

## Acknowledgments

- [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)
- [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector)
- [launch-editor](https://github.com/yyx990803/launch-editor)
