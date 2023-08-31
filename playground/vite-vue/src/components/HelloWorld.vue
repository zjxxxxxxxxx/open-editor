<script setup lang="ts">
import Notes from './Notes.vue';
import Tree from './tree/index.vue';
defineProps<{ msg: string }>();
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="card">
    <Notes />
  </div>
  <Tree />
  <p class="read-the-docs">
    <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
      Click to Github
    </a>
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
