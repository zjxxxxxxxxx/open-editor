<template>
  <Parent>
    <Child>ChildRight</Child>
  </Parent>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Parent from './components/Parent.vue';
import Child from './components/Child.vue';

export default defineComponent({
  name: 'App',
  components: {
    Parent,
    Child,
  },
});
</script>
