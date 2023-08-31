<script lang="ts">
import { defineComponent } from 'vue';
import Notes from './Notes.vue';

export default defineComponent({
  name: 'HelloWorld',
  tree: {
    Notes,
  },
  props: {
    msg: String,
  },
});
</script>

<template>
  <h1>{{ msg }}</h1>
  <div class="card">
    <Notes />
  </div>
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
