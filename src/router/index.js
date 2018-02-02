import Vue from 'vue'
import Router from 'vue-router'
import List from '@/views/List'

import Layout from '../views/Layout'
import Chat from '../views/Chat'
import Message from '../views/Message'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'List',
          component: List
        },
        {
          path: '/message',
          name: 'Message',
          component: Message
        }
      ]
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    }
  ]
})
