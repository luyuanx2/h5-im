<template>
  <div>
    <div></div>
    <div>
      <ul>
        <li v-for="(item, index) in chatListGetter">
          <span>{{item.time}}</span>
          <span>{{item.username}}</span>
          <img style="width: 32px;height: 32px" :src="item.avatar">
          <span>
            <h3></h3>
            <p></p>
          </span>
        </li>
      </ul>
    </div>
    <div>
      <div>
        <input v-model="inputMessage"/>
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        hxUser: '',
        username: '',
        chatMsg: [],
        userMessage: [],
        inputMessage: []
      }
    },
    created() {
      console.log('进入聊天窗口')
      this.hxUser = this.$route.query.hxUser || uri.getQueryString('hxUser')
    },
    computed: {
      chatListGetter() {
        return this.chatMsg.map(item => {
          item.avatar = 'aaa'//this.$$vm.friends[this.hxUser]['avatar']
          item.username = 'bbb'//this.$$vm.friends[this.hxUser]['user_name']

          if (item.style === 'self') {
            item.avatar = this.$$vm.user.photo
            item.username = this.$$vm.user.name
          }

          if (!item.avatar) {
            item.avatar = require('../assets/logo.png')
          }

          return item
        })
      }
    },
    mounted() {
      this.$nextTick(() => {
//        this.username = this.$$vm.doctors[this.hxUser]['user_name'] || ''
        if (!this.$$vm.chatMsg.hasOwnProperty(this.hxUser)) this.$$vm.chatMsg[this.hxUser] = []
        this.$set(this, 'chatMsg', this.$$vm.chatMsg[this.hxUser])// 历史消息
        this.init()
      })
    },
    methods: {
      init() {
        this.$$vm.$emit('readed', this.hxUser)
        this.$$vm.$watch(`chatMsg.${this.hxUser}`, (val, oldVal) => {
          console.log('[Leo]chatMsg change=>', val)
          this.$set(this, 'chatMsg', val)
          this.$$vm.$emit('readed', this.hxUser)
//          window.localStorage.setItem(this.hxUser, JSON.stringify(this.$$vm.chatMsg[this.hxUser]))
        })
      },
      sendMessage() {
        if (!this.inputMessage.trim()) {
          return;
        }
        this.$sendTxtMessage(this.inputMessage)

        this.userMessage = ''
        this.inputMessage = ''
      },
    }
  }
</script>

<style>

</style>
