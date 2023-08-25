<script setup lang="ts">
import Notes from './Notes.vue';
defineProps<{ msg: string }>();
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="card">
    <Notes />
  </div>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
