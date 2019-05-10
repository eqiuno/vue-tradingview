<<<<<<< HEAD
import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'

Vue.config.productionTip = false

Vue.prototype.$http = Axios

new Vue({
  render: h => h(App),
}).$mount('#app')
=======
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
>>>>>>> c16e10b1c13f1718af7f837761cffa34b5703d41
