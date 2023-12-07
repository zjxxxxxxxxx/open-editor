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
   * @default 'auto'
   */
  colorMode?: 'auto' | 'light' | 'dark';
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}
```
