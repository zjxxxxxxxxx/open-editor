# @open-editor/webpack

[![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A webpack plugin for fast find source code.

> Valid only during development, requires Node.js version 14+.

## Install

```bash
npm -D i @open-editor/webpack
```

## Usage

```ts
// webpack.config.js
const OpenEditorWebpackPlugin = require('@open-editor/webpack');

module.exports = {
  plugins: [
    new OpenEditorWebpackPlugin({
      /* options */
    }),
    // other plugins
  ],
};
```

## Configuration

```ts
interface Options {
  /**
   * source rootDir path
   *
   * @default process.cwd()
   */
  rootDir?: string;
  /**
   * render the toggle into the browser
   *
   * @default true
   */
  displayToggle?: boolean;
  /**
   * set UI color mode
   *
   * @default 'system'
   */
  colorMode?: 'system' | 'light' | 'dark';
  /**
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default false
   */
  disableHoverCSS?: boolean;
  /**
   * The inspector `overlay` synchronizes the UI every frame in real time, even if the browser is idle at that time.
   *
   * @default false
   */
  realtimeFrame?: boolean;
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}
```

## Playgrounds

| Source code                                                                                      | Online trial                                                                                          |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| [`webpack/nextjs`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next) | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next) |
| [`webpack/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)     | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)  |
