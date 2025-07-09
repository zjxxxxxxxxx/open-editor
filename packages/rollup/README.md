# @open-editor/rollup

[![NPM version](https://img.shields.io/npm/v/@open-editor/rollup?color=)](https://www.npmjs.com/package/@open-editor/rollup)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A rollup plugin for fast find source code.

[Home](https://github.com/zjxxxxxxxxx/open-editor#readme)

## Install

```bash
npm i @open-editor/rollup -D
```

## Usage

```ts
// rollup.config.ts
import openEditor from '@open-editor/rollup';

export default defineConfig({
  plugins: [
    openEditor({
      /* options */
    }),
    // other plugins
  ],
});
```

## Options

````ts
/**
 * 插件配置选项 | Plugin Configuration Options
 */
export interface Options {
  /**
   * 源代码根目录路径 | Source code root directory path
   * @default `process.cwd()`
   * @example
   * ```ts
   * rootDir: path.resolve(__dirname, 'src')
   * ```
   */
  rootDir?: string;

  /**
   * 在浏览器显示切换按钮 | Display toggle button in browser
   * @default `true`
   * @remarks
   * 控制是否在页面右下角显示调试开关 | Controls whether to show debug toggle at bottom-right corner
   */
  displayToggle?: boolean;

  /**
   * 禁用 CSS 悬停效果 | Disable CSS hover effects
   * @default `true`
   * @remarks
   * 当检查器启用时禁用元素悬停高亮 | Disable element highlighting on hover when inspector is active
   */
  disableHoverCSS?: boolean;

  /**
   * 忽略指定目录的组件 | Ignore components in specified directories
   * @default `\/**\/node_modules\/**\/*`
   * @see [Glob Pattern Syntax](https://en.wikipedia.org/wiki/Glob_(programming))
   * @remarks
   * 使用 glob 模式匹配需要忽略的路径 | Use glob patterns to match ignored paths
   */
  ignoreComponents?: string | string[];

  /**
   * 单次检查模式 | Single-inspection mode
   * @default `true`
   * @remarks
   * 打开编辑器或组件树后自动退出检查状态 | Automatically exit inspection after opening editor or component tree
   */
  once?: boolean;

  /**
   * 跨 iframe 交互支持 | Cross-iframe interaction
   * @default `true`
   * @remarks
   * 允许在子 iframe 中提升操作到父窗口（仅限同源）| Enable elevating operations from child iframes to parent window (same-origin only)
   */
  crossIframe?: boolean;

  /**
   * 服务端配置 | Server Configuration
   */
  server?: {
    /**
     * HTTPS 安全传输层配置 | HTTPS Secure Transport Layer Configuration
     * @see [TLS Context Options](https://nodejs.org/api/tls.html#tlscreatesecurecontextoptions)
     * @example
     * {
     *   key: '/path/to/private.key',
     *   cert: '/path/to/certificate.pem'
     * }
     */
    https?: {
      /**
       * PEM 格式的 SSL 私钥文件路径 | Path to PEM formatted SSL private key file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      key: string;

      /**
       * PEM 格式的 SSL 证书文件路径 | Path to PEM formatted SSL certificate file
       * @fileMustExist 文件必须存在且可读 | File must exist and be readable
       */
      cert: string;
    };
  };

  /**
   * 自定义编辑器打开处理器 | Custom editor opening handler
   * @default `launch-editor`
   * @remarks
   * 覆盖默认的文件打开逻辑 | Override default file opening behavior
   */
  onOpenEditor?(file: string, errorCallback: (errorMessage: string) => void): void;
}
````

## Playgrounds

| Source code                                                                                         | Online trial                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`rollup/react15`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-react15) |
| [`rollup/vue2`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)       | [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playgrounds/rollup-vue2)    |
