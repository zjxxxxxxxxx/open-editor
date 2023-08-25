<script lang="ts">
import { defineComponent } from 'vue';
import Notes from './Notes.vue';

export default defineComponent({
  name: 'HelloWorld',
  components:{
    Notes
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
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
