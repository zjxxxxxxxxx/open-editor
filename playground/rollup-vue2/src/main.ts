import Vue from 'vue';
import VueSoucre from 'unplugin-vue-source/vue';
import './style.css';
import App from './App.vue';

Vue.use(VueSoucre);

new Vue({
  el: '#root',
  render: (h) => h(App),
});
