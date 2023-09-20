# @open-editor/rollup

A rollup plugin for fast find source code.

> For development only

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
