import Vue from 'vue';
import VueSoucre from '@open-editor/vue-source/vue';
import App from './App.vue';

Vue.use(VueSoucre);

new Vue({
  el: '#root',
  render: (h) => h(App),
});
