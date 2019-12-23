// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import store from '@/store.js';
import VueAnalytics from 'vue-analytics';
import {
  sync
} from 'vuex-router-sync';

sync(store, router);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App
  },
  template: '<App/>'
});

Vue.use(VueAnalytics, {
  id: 'UA-93929869-7',
  router
});