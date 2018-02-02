import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import IM from './plugin/webim'
import './assets/font/iconfont.css'

Vue.use(IM)
Vue.config.productionTip = false

/* eslint-disable no-new */
window._vm = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
