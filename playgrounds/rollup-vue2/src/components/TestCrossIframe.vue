<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TestCrossIframe',
});
</script>

<template>
  <iframe scrolling="no" src="/test-component-tree" />
</template>
