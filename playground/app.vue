<script lang="ts" setup>
import './components/Header.vue';
</script>

<template>
  <div class="flex flex-col">
    <header class="flex-shrink-0">
      <Header />
    </header>
    <main class="flex-1">
      <Content />
    </main>
  </div>
</template>
