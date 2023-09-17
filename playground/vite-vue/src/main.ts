import { createApp } from 'vue';
import VueSoucre from 'unplugin-vue-source/vue';
import './style.css';
import App from './App.vue';

createApp(App).use(VueSoucre).mount('#app');
