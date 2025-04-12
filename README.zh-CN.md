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

`Open Editor` 是一款专为现代 Web 开发打造的前端调试工具。通过深度集成构建工具链，该工具实现了「浏览器元素 ↔ 源代码」的双向精准映射，不仅支持开发者直接在 React/Vue 组件树中定位源码位置，还能自动唤醒本地 IDE 打开对应文件。这一创新方案可帮助开发者节省超过 90% 的源码定位时间，显著提升调试效率。

[▶▶▶ 立即体验 (Vite+React 示例)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)  
[![功能演示](./public/demo.gif)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/vite-react?embed=1&file=vite.config.ts&hideExplorer=1)

## 🚀 核心功能

### 框架支持

- **React 生态**：深度适配 Create React App/Next.js 等现代脚手架
- **Vue 生态**：完整支持 Vue CLI/Nuxt.js/Vite 等开发方案
- **构建工具**：全面兼容 Webpack 4+/Vite 2+/Rollup 2+ 体系

### 调试能力

- 🕵️ 多层级组件树追溯（支持跨 iframe 通信场景）
- ⌨️ 快捷键驱动工作流（⌥⌘O 启动调试器，ESC 退出检查模式）
- 📱 移动端远程调试支持（需与桌面端同局域网）
- 🔍 智能编辑器探测（自动识别 VS Code/WebStorm 等本地 IDE）
- 🚫 零侵入设计（无需项目端导入 SDK 或配置）

### 环境支持

- **专属模式**：开发环境独占功能（生产环境自动禁用）
- **运行时要求**：
  - Node.js 14+ 运行环境（推荐 LTS 版本）
  - 现代浏览器要求（需满足以下任意最新稳定版）：
    - Google Chrome ≥ 89（2021/03 发布）
    - Mozilla Firefox ≥ 85（2021/01 发布）
    - Microsoft Edge ≥ 90（2021/04 发布）
    - Apple Safari ≥ 14（2020/09 发布）

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

- 快捷键操作：
  - macOS: Option + Command + O
  - Windows: Alt + Ctrl + O
- 鼠标操作：
  - 点击浏览器工具栏的切换按钮

###### 切换按钮示意图

<img src="./public/toggle-button-demo.png" width="500" alt="切换按钮状态对比">

##### 2. 元素审查

- 悬停预览：
  - 鼠标悬停组件显示源码定位（支持文件行列号）
- 精准定位：
  - 单击元素直接跳转编辑器（自动定位行列）
  - 深度审查模式：
    - macOS: 按 Command + 点击元素展开组件树
    - Windows: 按 Ctrl + 点击元素展开组件树
    - 长按元素300毫秒展开组件树

###### 悬停预览示意图

<img src="./public/inspect-element-demo.png" width="500" alt="悬停定位效果演示">

###### 组件树预览示意图

<img src="./public/open-tree-demo.png" width="500" alt="组件树结构展示">

##### 3. 退出检查器

- 快捷键操作：
  - 通用: Esc
  - macOS: 再次按 Option + Command + O
  - Windows: 再次按 Alt + Ctrl + O
- 鼠标操作：
  - 点击切换按钮关闭审查模式
  - 右键点击页面空白区域

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
  const url = e.detail;
  url.hostname = 'localhost'; // 修正域名
  fetch(url);
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

## 特别致谢

本项目的实现深受以下优秀开源项目的启发和帮助：

- [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector) - React 组件调试利器
- [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector) - Vue 组件调试解决方案
- [launch-editor](https://github.com/yyx990803/launch-editor) - 编辑器快速定位核心实现
