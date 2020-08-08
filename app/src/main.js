// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueAxiosPlugin from 'vue-axios-plugin'

Vue.use(VueAxiosPlugin, {
  reqHandleFunc: config => config,
  reqErrorFunc: error => Promise.reject(error),
  resHandleFunc: response => response,
  resErrorFunc: error => Promise.reject(error)
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
