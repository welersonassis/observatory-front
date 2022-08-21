import Vue from 'vue'
import App from './App.vue'
import filters from './filters/index.js';
import './assets/fonts/style.css';
import store from "./store";
import router from "./router";
import PortalVue from 'portal-vue';


import 'focus-visible';
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

window._merge = require('lodash/merge');
window.axios = require('axios');
window.Vue = Vue;
Vue.use(filters);
Vue.use(PortalVue);

if (process.env.NODE_ENV === 'production') {
  window.isProduction = true;
} else {
  window.isProduction = false;
  Vue.preUrl = "http://localhost:8000";
}

new Vue({
  store,
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')


