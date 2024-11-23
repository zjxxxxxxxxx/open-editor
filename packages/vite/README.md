# @open-editor/vite

[![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A vite plugin for fast find source code.

> Valid only during development, requires Node.js version 14+.

## Install

```bash
npm i @open-editor/vite -D
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
   * @default true
   */
  crossIframe?: boolean;
  /**
   * custom openEditor handler
   *
   * @default 'launch-editor'
   */
  onOpenEditor?(file: string): void;
}
```

## Playgrounds

| Source code                                                                                | Online trial                                                                                        |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| [`vite/react`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react) | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react) |
| [`vite/vue`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue)     | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue)   |
| [`vite/nuxt`](https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-nuxt)   | [StackBlitz](https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-nuxt)  |
