<script lang="ts" setup>
const count = ref(0);
</script>

<template>
  <header style="padding:300px">
    <button @click="count--">-</button>
    <span> {{ count }} </span>
    <button @click="count++">+</button>
    <div
      style="
        margin:  -100px;
        width: 200px;
        height: 150px;
        background-color: aqua;
      "
    ></div>
    <div
      style="margin: 100px; width: 200px; height: 150px; background-color: aqua"
    ></div>
  </header>
</template>

<style lang="scss"></style>
