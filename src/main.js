import Vue from 'vue'
import App from './App.vue'

import jsonp from 'vue-jsonp'
Vue.use(jsonp)

import {
  Upload,
  Message
} from 'element-ui'
Vue.use(Upload);
Vue.prototype.$message = Message;


new Vue({
  el: '#app',
  render: h => h(App)
})
