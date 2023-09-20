# @open-editor/vite

[![NPM version](https://img.shields.io/npm/v/@open-editor/vite?color=)](https://www.npmjs.com/package/@open-editor/vite)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

A vite plugin for fast find source code.

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

The following show the default values of the configuration

```ts
OpenEditor({
  // source root path
  rootDir: process.cwd(),

  // render the toggle into the browser
  displayToggle: false,

  // custom openEditor handler
  onOpenEditor: undefined,
});
```
