<script setup lang="ts">
import Notes from '../components/Notes.vue';

defineOptions({
  name: 'App',
});
</script>

<template>
  <div class="app">
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src="/vite.svg" class="logo" alt="Vite logo" />
      </a>
      <a href="https://nuxt.com" target="_blank">
        <img src="/nuxt.svg" class="logo nuxt" alt="Nuxt logo" />
      </a>
      <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
        <img src="/logo.png" class="logo open-editor" alt="OpenEditor logo" />
      </a>
    </div>
    <h1>Vite + Nuxt</h1>
    <iframe scrolling="no" src="/test-cross-iframe" />
    <div class="card">
      <Notes />
    </div>
    <p class="read-the-docs">
      <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor"> Github </a>
    </p>
  </div>
</template>
