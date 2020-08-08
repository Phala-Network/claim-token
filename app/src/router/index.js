import Vue from 'vue'
import Router from 'vue-router'
import ClaimToken from '@/components/ClaimToken'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ClaimToken',
      component: ClaimToken
    }
  ]
})
