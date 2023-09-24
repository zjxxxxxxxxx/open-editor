<script lang="ts">
import Vue from 'vue';
import Tree from './components/tree/index.vue';
import Notes from './components/Notes.vue';

export default Vue.extend({
  components: {
    Tree,
    Notes,
  },
});
</script>

<template>
  <div>
    <div>
      <a href="https://rollupjs.org" target="_blank">
        <img src="../public/rollup.svg" class="logo" alt="Rollup logo" />
      </a>
      <a href="https://vuejs.org/" target="_blank">
        <img src="../public/vue.svg" class="logo vue" alt="Vue logo" />
      </a>
    </div>
    <h1>Rollup + Vue2</h1>
    <Tree />
    <div class="card">
      <Notes />
    </div>
    <p class="read-the-docs">
      <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
        Github
      </a>
    </p>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.read-the-docs {
  color: #888;
}
</style>
