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

first add the `openEditor` to `vite.config.js`.

```js
import { defineConfig } from 'vite';
import openEditor from '@open-editor/vite';

export default defineConfig({
  plugins: [openEditor()],
});
```

press hotkey <kbd>Option ⌥</kbd> + <kbd>Command ⌘</kbd> + <kbd>O</kbd>, then click the HTML element you wish to inspect.

press hotkey <kbd>Option ⌥</kbd> + <kbd>Command ⌘</kbd> + <kbd>O</kbd> or <kbd>Esc</kbd> again to exit inspect.

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
     <td>enablePointer</td>
     <td>boolean</td>
     <td>false</td>
     <td>render the pointer into the browser</td>
    </tr>
    <tr>
     <td>rootDir</td>
     <td>string</td>
     <td>process.cwd()</td>
     <td>source rootDir path</td>
    </tr>
  </tbody>
</table>
