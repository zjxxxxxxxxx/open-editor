# @open-editor/rollup

A rollup plugin for fast find source code.

## Install

npm

```bash
npm -D i @open-editor/rollup
```

yarn

```bash
yarn -D add @open-editor/rollup
```

pnpm

```bash
pnpm -D add @open-editor/rollup
```

## Usage

add `openEditor` to `rollup.config.js`.

it only works for `process.env.NODE_ENV === 'development'`.

```js
const openEditor = require('@open-editor/rollup');

module.exports = {
  entry: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm',
    },
  ],
  plugins: [openEditor()],
};
```

press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.

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
    <tr></tr>
    <tr>
      <th>react15</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-react15"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-react15"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>vue2</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-vue2"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/rollup-vue2"
        >
          StackBlitz
        </a>
      </th>
    </tr>
  </tbody>
</table>
