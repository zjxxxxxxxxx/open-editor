# @open-editor/webpack

A webpack plugin for fast find source code.

> For development only

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
