<script setup lang="ts">
import Tree from './components/tree/index.vue';
import Notes from './components/Notes.vue';
</script>

<template>
  <div>
    <a href="https://webpack.js.org" target="_blank">
      <img src="/webpack.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org" target="_blank">
      <img src="/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
      <img src="/logo.png" class="logo open-editor" alt="OpenEditor logo" />
    </a>
  </div>
  <h1>Webpack + Vue</h1>
  <Tree />
  <div class="card">
    <Notes />
  </div>
  <p class="read-the-docs">
    <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
      Github
    </a>
  </p>
</template>

<style scoped>
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
  filter: drop-shadow(0 0 2em #1d78c1aa);
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
</style>
