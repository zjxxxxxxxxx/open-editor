# @open-editor/vite

[![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A vite plugin for fast find source code, supported in `React` & `Vue`.

> For development only

## Install

```bash
npm -D i @open-editor/vite
```

## Usage

```ts
// vite.config.ts
import OpenEditor from '@open-editor/vite';

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
   * @default false
   */
  displayToggle?: boolean;
  /**
   * custom openEditor handler
   */
  onOpenEditor?(file: string): void;
}
```
