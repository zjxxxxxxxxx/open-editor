<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor">
      <img width="120px" src="./public/logo.png" alt="Open Editor" />
      <h1 align="center">Open Editor</h1>
  </a>
</p>
</br>
<p align="center">
  <a href="https://github.com/zjxxxxxxxxx/open-editor/actions/workflows/ci.yml">
    <img src="https://github.com/zjxxxxxxxxx/open-editor/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/github/license/zjxxxxxxxxx/open-editor" alt="MIT">
  </a>
</p>
</br>

A web devtools for fast find source code, supported in `React` & `Vue`.

They achieve exactly the same effect whether in `React` or `Vue`.

If you need to switch back and forth between `React` & `Vue` frequently, or if you have both `React` & `Vue` in the same project, then this devtools is for you.

![image](./public/demo.gif)

## Features

- 🎉 Support composite key.
- 🎯 Support component tree.
- 💝 Support Rollup & Vite & Webpack.
- 🌟 Support React & Next & Vue.
- 🚀 Support non-inductive inject client runtime.

Minimum environment requirement `node14+`, `chorme` is recommended for inspect.

> For development only

## Frameworks

### React

Minimum version requirements `React15+`.

It needs to be used with [`@babel/plugin-transform-react-jsx-source`](https://babeljs.io/docs/babel-plugin-transform-react-jsx-source), usually you don't have to worry about this because it's mostly built into scaffolding tools.

### Vue

Minimum version requirements `Vue2+`.

By default, you can only open to `file`, if you want to open to `line` and `column`, you need to additionally install [`unplugin-vue-source`](https://github.com/zjxxxxxxxxx/unplugin-vue-source) to use with it.

## Usage in the browser

1. press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.
2. press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then press hotkey ⌨️ <kbd>command ⌘</kbd> + 🖱 click the HTML element show component tree.
3. press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then 🖱 long press the HTML element show component tree.
4. press hotkey ⌨️ <kbd>esc</kbd> or 🖱 right-click to exit inspect.
5. 🖱 hold the toggle button and drag the mouse to adjust the toggle position.

## Plugins

- [`@open-editor/rollup`](./packages/rollup/README.md)
- [`@open-editor/vite`](./packages/vite/README.md)
- [`@open-editor/webpack`](./packages/webpack/README.md)

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

# Thanks

The library was mainly inspired by a few great libraries.

- [react-dev-inspector](https://github.com/zthxxx/react-dev-inspector)
- [vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector)
