# @open-editor/vite

a vite plugin that opens the code editor by clicking on the browser UI.

## Install

npm

```bash
npm i --save-dev @open-editor/vite
```

yarn

```bash
yarn add --save-dev @open-editor/vite
```

pnpm

```bash
pnpm add --save-dev @open-editor/vite
```

## Usage

add `OpenEditor` to `vite.config.ts`.

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
      <th>react + vite</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/react-vite"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/react-vite"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>vue + vite</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/vue-vite"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/vue-vite"
        >
          StackBlitz
        </a>
      </th>
    </tr>
    <tr>
      <th>svelte + vite</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/svelte-vite"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/svelte-vite"
        >
          StackBlitz
        </a>
      </th>
    </tr>
     <tr>
      <th>qwik + vite</th>
      <th>
        <a
          href="https://github.com/zjxxxxxxxxx/open-editor/tree/main/playground/qwik-vite"
        >
          Source
        </a>
      </th>
      <th>
        <a
          href="https://stackblitz.com/github/zjxxxxxxxxx/open-editor/tree/main/playground/qwik-vite"
        >
          StackBlitz
        </a>
      </th>
    </tr>
  </tbody>
</table>
