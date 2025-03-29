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

## 🔍 项目简介

Open Editor 是一款基于AST解析技术的智能调试工具，专为现代Web开发场景打造。通过深度整合构建工具链，系统实现了「浏览器元素 ↔ 源代码」的双向精准映射，支持开发者在 React/Vue 组件树中直接定位源码位置，并可通过一键操作唤起本地 IDE 打开对应文件。该解决方案的革命性价值在于能帮助开发者节省超过 90%+ 的源码定位时间，显著提升调试效率。

[▶▶▶ 立即体验 (Vite+React 示例)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)  
[![功能演示](./public/demo.gif)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)

## 🚀 核心功能

### 框架支持

- **React 生态**：Create React App/Next.js 等脚手架深度适配
- **Vue 生态**：Vue CLI/Nuxt.js/Vite 等脚手架深度适配
- **构建工具**：Webpack 4+/Vite 2+/Rollup 2+ 全兼容

### 调试能力

- 多层级组件树追溯（支持跨 iframe 通信）
- 快捷键驱动工作流（⌥⌘O 启动/退出检查器）
- 移动端远程调试支持
- 智能编辑器探测（自动识别本地安装的 IDE）

### 环境支持

- **专属模式**：仅限开发环境使用
- **运行时要求**：
  - Node.js 14+
  - 现代浏览器（需满足以下任意浏览器的最新稳定版）：
    - Google Chrome ≥ 89（2021年3月发布）
    - Mozilla Firefox ≥ 85（2021年1月发布）
    - Microsoft Edge ≥ 90（2021年4月发布）
    - Apple Safari ≥ 14（2020年9月发布）
- **安全协议**：要求启用TLS 1.2/1.3协议

## 🛠️ 快速入门

### 前置条件

#### React 项目

```bash
# 验证 Babel 插件配置
npm list @babel/plugin-transform-react-jsx-source
```

> 若使用自定义 Babel 配置，请确保启用该插件

#### Vue 项目

```bash
# 安装必要依赖
npm install unplugin-vue-source -D
```

> 缺少该插件将导致行列定位失效

### 集成示例

> 本示例采用 [`Vite+React`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react) 框架进行演示，其他技术栈仅需调整对应配置项即可，核心使用逻辑保持完全一致。

#### 工具集成

##### 1.安装插件

```bash
npm i @open-editor/vite -D
```

##### 2.添加配置

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

##### 3.启动开发环境

```bash
npm run dev
```

#### 调试流程

##### 1. 激活检查器

- **快捷键**：⌥⌘O（Mac）| Alt+Ctrl+O（Win）
- **鼠标**：点击浏览器右上角切换按钮

  ###### 切换按钮示意图

  <img src="./public/toggle-button-demo.png" width="500">

##### 2. 元素审查

- **悬停预览**：鼠标悬浮显示源码位置
- **精准定位**：

  - 单击元素打开编辑器（支持行列跳转）
  - 长按元素（或 ⌘+点击）展开组件树

  ###### 悬停预览示意图

  <img src="./public/inspect-element-demo.png" width="500">

  ###### 组件树预览示意图

  <img src="./public/open-tree-demo.png" width="500">

##### 3. 退出检查器

- **快捷键**：Esc 或再次触发 ⌥⌘O（Mac）| Alt+Ctrl+O（Win）
- **鼠标**：点击切换按钮选择退出（或点击鼠标右键）

## ⚙️ 高级功能

### 全局事件

```ts
// 自定义激活检查器逻辑
window.addEventListener('enableinspector', (e) => {
  e.preventDefault(); // 阻断默认行为
});

// 自定义退出检查器逻辑
window.addEventListener('exitinspector', (e) => {
  e.preventDefault(); // 阻断默认行为
});

// 自定义编辑器启动逻辑
window.addEventListener('openeditor', (e) => {
  const url = new URL(e.detail);
  url.hostname = 'localhost'; // 修正域名
  window.open(url.toString());
  e.preventDefault(); // 阻断默认行为
});
```

## 🖼 生态系统

### 官方插件集

| 说明文档                                                                                        | NPM 版本                                                                                                                       | 下载量                                                                                                                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [`@open-editor/rollup`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/rollup)   | [![NPM version](https://img.shields.io/npm/v/@open-editor/rollup?color=)](https://www.npmjs.com/package/@open-editor/rollup)   | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/rollup)](https://www.npmjs.com/package/@open-editor/rollup)   |
| [`@open-editor/vite`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/vite)       | [![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)       | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/vite)](https://www.npmjs.com/package/@open-editor/vite)       |
| [`@open-editor/webpack`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/packages/webpack) | [![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack) | [![NPM downloads](https://img.shields.io/npm/dt/%40open-editor/webpack)](https://www.npmjs.com/package/@open-editor/webpack) |

### 在线演练场

| 源代码                                                                                              | 在线试玩                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`rollup/react15`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) |
| [`rollup/vue2`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)       | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)    |
| [`vite/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react)         | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react)     |
| [`vite/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-vue)             | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-vue)       |
| [`vite/nuxt`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-nuxt)           | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-nuxt)      |
| [`webpack/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-react)   | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-react)  |
| [`webpack/nextjs`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-nextjs) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-nextjs) |
| [`webpack/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-vue)       | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/webpack-vue)    |

## 致谢

- [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)
- [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector)
- [launch-editor](https://github.com/yyx990803/launch-editor)
