# @open-editor/webpack

[![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A webpack plugin for fast find source code.

> Valid only during development, requires Node.js version 14+.

## Install

```bash
npm i @open-editor/webpack -D
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
   * Disable hover effect from CSS when inspector is enabled
   *
   * @default true
   */
  disableHoverCSS?: boolean;
  /**
   * Ignoring components in some directories, using glob pattern syntax for matching
   *
   * @see https://en.wikipedia.org/wiki/Glob_(programming)
   *
   * @default '\/**\/node_modules\/**\/*'
   */
  ignoreComponents?: string | string[];
  /**
   * exit the check after opening the editor or component tree
   *
   * @default true
   */
  once?: boolean;
  /**
   * Enable interaction between multiple iframes to be promoted to the top-level window.
   *
   * It only takes effect when the top window and iframe window have the same origin.
   *
   * @default false
   */
  crossIframe?: boolean;
  /**
   * Internal server configuration
   */
  server?: {
    /**
     * enable https
     *
     * @see https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options
     */
    https?: {
      key: string;
      cert: string;
    };
  };
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}
```

## Playgrounds

| Source code                                                                                        | Online trial                                                                                            |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [`webpack/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-react)   | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-react)  |
| [`webpack/nextjs`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-nextjs) | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-nextjs) |
| [`webpack/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)       | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue)    |
| [`webpack/nuxt`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-nuxt)     | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-nuxt)   |
