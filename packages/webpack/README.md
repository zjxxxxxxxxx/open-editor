# @open-editor/webpack

a webpack plugin that opens the code editor by clicking on the browser UI.

## Install

npm

```bash
npm i --save-dev @open-editor/webpack
```

yarn

```bash
yarn add --save-dev @open-editor/webpack
```

pnpm

```bash
pnpm add --save-dev @open-editor/webpack
```

## Usage

first add the `OpenEditorWebpackPlugin` to `webpack.config.js`.

```js
const OpenEditorWebpackPlugin = require('@open-editor/webpack');

module.exports = {
  entry: 'index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js',
  },
  plugins: [new OpenEditorWebpackPlugin()],
};
```

press hotkey <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.

press hotkey <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd> or <kbd>esc</kbd> again to exit inspect.

## Options

<table>
  <thead>
    <tr>
      <td>key</td>
      <td>type</td>
      <td>default</td>
      <td>description</td>
    </tr>
  </thead>
  <tbody>
    <tr>
     <td>displayToggle</td>
     <td>boolean</td>
     <td>false</td>
     <td>render the toggle into the browser</td>
    </tr>
    <tr>
     <td>rootDir</td>
     <td>string</td>
     <td>process.cwd()</td>
     <td>source rootDir path</td>
    </tr>
  </tbody>
</table>
