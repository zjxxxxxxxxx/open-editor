# @open-editor/webpack

[![NPM version](https://img.shields.io/npm/v/@open-editor/webpack?color=)](https://www.npmjs.com/package/@open-editor/webpack)
[![MIT](https://img.shields.io/github/license/zjxxxxxxxxx/open-editor)](https://opensource.org/licenses/MIT)

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
