<template>
  <div className="{[style.box," style.parent]}>
    <div className="{[style.box," style.child]}>
      <Child>ChildLeft</Child>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import Child from './Child.vue';
</script>
