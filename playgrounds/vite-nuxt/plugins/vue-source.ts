import VueSource from 'unplugin-vue-source/vue';

export default defineNuxtPlugin({
  name: 'vue-source',
  async setup(nuxtApp) {
    nuxtApp.vueApp.use(VueSource);
  },
});
