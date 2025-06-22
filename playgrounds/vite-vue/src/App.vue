<script setup lang="tsx">
import { ref } from 'vue';
import TestCrossIframe from './components/TestCrossIframe.vue';
import TestComponentTree from './components/TestComponentTree.vue';
import Notes from './components/Notes.tsx';

const pathname = ref(location.pathname);

defineExpose({
  pathname,
});
</script>

<template>
  <TestCrossIframe v-if="pathname === '/test-cross-iframe'" />
  <TestComponentTree v-else-if="pathname === '/test-component-tree'" />
  <div class="app" v-else>
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://vuejs.org" target="_blank">
        <img src="/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
      <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
        <img src="/logo.png" class="logo open-editor" alt="OpenEditor logo" />
      </a>
    </div>
    <h1>Vite + Vue</h1>
    <iframe scrolling="no" src="/test-cross-iframe" />
    <div class="card">
      <Notes />
    </div>
    <p class="read-the-docs">
      <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor"> Github </a>
    </p>
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #202327;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

#root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  padding: 0;
}

iframe {
  width: 240px;
  height: 42px;
  border: none;
  border-radius: 8px;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #202327;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

kbd {
  display: inline-block;
  padding: 3px 5px;
  font-size: 12px;
  line-height: 10px;
  color: #e6edf3;
  vertical-align: middle;
  background-color: #161b22;
  border: solid 1px rgba(110, 118, 129, 0.4);
  border-radius: 6px;
  box-shadow: inset 0 -1px 0 rgba(110, 118, 129, 0.4);
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
  kbd {
    color: #1f2328;
    background-color: #f6f8fa;
    border: solid 1px rgba(175, 184, 193, 0.2);
    box-shadow: inset 0 -1px 0 rgba(175, 184, 193, 0.2);
  }
}

.app {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column;
  margin: 0 auto;
  padding: 2rem;
  max-width: 1280px;
  min-height: calc(100vh - 4rem);
  text-align: center;
}

.card {
  padding: 2em;
  zoom: 2;
}

.card > div {
  zoom: 0.5;
}

.logo {
  width: 6em;
  height: 6em;
  padding: 1.5em;
  overflow: hidden;
  border-radius: 40px;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.logo.open-editor:hover {
  filter: drop-shadow(0 0 2em #000000aa);
}

@media (prefers-color-scheme: dark) {
  .logo.open-editor:hover {
    filter: drop-shadow(0 0 2em #ffffffaa);
  }
}

.read-the-docs {
  color: #888;
}

.test-button {
  width: 240px;
  height: 42px;
}
</style>
