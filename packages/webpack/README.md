# @open-editor/webpack

A webpack plugin for fast find source code.

## Install

npm

```bash
npm -D i @open-editor/webpack
```

yarn

```bash
yarn -D add @open-editor/webpack
```

pnpm

```bash
pnpm -D add @open-editor/webpack
```

## Usage

add `OpenEditorWebpackPlugin` to `webpack.config.js`.

it only works for `process.env.NODE_ENV === 'development'`.

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

press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then 🖱 click the HTML element you wish to inspect.

press hotkey ⌨️ <kbd>command ⌘</kbd> + 🖱 click, show component tree.

press hotkey ⌨️ <kbd>esc</kbd> or 🖱 right-click to exit inspect.

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
      <td>rootDir</td>
      <td>string</td>
      <td>process.cwd()</td>
      <td>source rootDir path</td>
    </tr>
    <tr>
      <td>displayToggle</td>
      <td>boolean</td>
      <td>false</td>
      <td>render the toggle into the browser</td>
    </tr>
  </tbody>
</table>

## Playground

<table>
  <tbody>
    <tr>
      <th>next</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-next"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>vue</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/webpack-vue"
        >
          StackBlitz
        </a>
      </th>
    </tr>
  </tbody>
</table>
