<h1 align="center">Open Editor</h1>

A web devtools for fast find source code.

![image](./public//demo.gif)

## Features

- Support composite key.
- Support component tree.
- Support Rollup & Vite & Webpack.
- Support React & Next & Vue.
- Support non-inductive inject client runtime.

> For development only

## Frameworks

### React

Minimum version requirements `React15+`.

It needs to be used with [@babel/plugin-transform-react-jsx-source](https://babeljs.io/docs/babel-plugin-transform-react-jsx-source), usually you don't have to worry about this because it's mostly built into scaffolding tools.

### Vue

Minimum version requirements `Vue2+`.

By default, you can only open to files, if you want to open to rows and columns, you need to additionally install [unplugin-vue-source](https://github.com/zjxxxxxxxxx/unplugin-vue-source) to use with it.

## Usage in the browser

1. press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.
2. press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then press hotkey ⌨️ <kbd>command ⌘</kbd> + 🖱 click, show component tree.
3. press hotkey ⌨️ <kbd>esc</kbd> or 🖱 right-click to exit inspect.

## Plugins

- [@open-editor/rollup](./packages/rollup/README.md)
- [@open-editor/vite](./packages/vite/README.md)
- [@open-editor/webpack](./packages/webpack/README.md)

## Playground

<table>
  <tbody>
    <tr>
      <th align="left">rollup + react15</th>
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
      <th align="left">rollup + vue2</th>
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
    <tr>
      <th align="left">vite + react</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th align="left">vite + vue</th>
      <th>
        <a
          target="_black"
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue"
        >
          Source
        </a>
      </th>
      <th>
        <a
          target="_black"
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr></tr>
    <tr>
      <th align="left">webpack + next</th>
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
      <th align="left">webpack + vue</th>
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
