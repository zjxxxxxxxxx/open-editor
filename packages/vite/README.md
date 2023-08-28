# @open-editor/vite

A vite plugin for fast find source code.

## Install

npm

```bash
npm -D i @open-editor/vite
```

yarn

```bash
yarn -D add @open-editor/vite
```

pnpm

```bash
pnpm -D add @open-editor/vite
```

## Usage

add `OpenEditor` to `vite.config.ts`.

it only works for `process.env.NODE_ENV === 'development'`.

```js
import { defineConfig } from 'vite';
import OpenEditor from '@open-editor/vite';

export default defineConfig({
  plugins: [OpenEditor()],
});
```

press hotkey ⌨️ <kbd>option ⌥</kbd> + <kbd>command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.

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
      <th>react</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-react"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>vue</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-vue"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>svelte</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-svelte"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-svelte"
        >
          StackBlitz
        </a>
      </th>
    </tr>
     <tr>
      <th>qwik</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vite-qwik"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vite-qwik"
        >
          StackBlitz
        </a>
      </th>
    </tr>
  </tbody>
</table>
