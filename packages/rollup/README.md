# @open-editor/rollup

[![NPM version](https://img.shields.io/npm/v/@open-editor/rollup?color=)](https://www.npmjs.com/package/@open-editor/rollup)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A rollup plugin for fast find source code.

> Valid only during development, requires Node.js version 14+.

## Install

```bash
npm -D i @open-editor/rollup
```

## Usage

```ts
// rollup.config.ts
import OpenEditor from '@open-editor/rollup';

export default defineConfig({
  plugins: [
    OpenEditor({
      /* options */
    }),
    // other plugins
  ],
});
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
