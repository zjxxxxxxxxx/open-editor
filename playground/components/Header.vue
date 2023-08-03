<script lang="ts" setup>
const count = ref(0);
</script>

<template>
  <header>
    <button @click="count--">-</button>
    <span> {{ count }} </span>
    <button @click="count++">+</button>
  </header>
</template>

<style lang="scss"></style>
