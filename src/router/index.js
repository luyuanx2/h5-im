import Vue from 'vue'
import Router from 'vue-router'
import List from '@/views/List'

import Chat from '../views/Chat'
import Message from '../views/Message'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/message',
      name: 'Message',
      component: Message
    },
    {
      path: '/',
      name: 'List',
      component: List
    },
    {
      path: '/chat',
      name: 'Chat',
      component: Chat
    }
  ]
})
