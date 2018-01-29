<template>
  <div>
    <div></div>
    <div>
      <ul v-if="chatListGetter.length">
        <li v-for="(item, index) in chatListGetter">
          <img style="width: 32px;height: 32px" :src="item.avatar">
          <span>{{item.time}}</span>
          <span>{{item.username}}</span>
          <div>
            <template v-if="item.msg.type == 'img'">
              <img :src="item.msg.data || item.msg.url">
              <!--<picture :data="item.msg.data"></picture>-->
            </template>
            <template v-else>
              <txt v-for="(item, index) in item.msg.data" :key="index" :data="item.data"></txt>
            </template>
          </div>
        </li>
      </ul>
    </div>
    <div>
      <div>
        <input v-model="inputMessage"/>
        <input ref="uploader" type="file" @change="sendImage"/>
        <button @click="sendMessage">发送</button>
        <button @click="clearMsg">清除聊天记录</button>
      </div>
    </div>
  </div>
</template>

<script>
  import Picture from '../components/chat/Picture'
  import Txt from '../components/chat/Txt'
  export default {
    components: {
      Picture,
      Txt
    },
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
      this.hxUser = this.$route.query.hxUser || uri.getQueryString('hxUser')
    },
    computed: {
      chatListGetter() {
        return this.chatMsg.map(item => {

          let index =  this.$$vm.friends.findIndex((item) => {
            return item.name === this.hxUser
          })
          item.username = this.$$vm.friends[index]['name']
          // item.avatar = this.$$vm.friends[index]['avatar']

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
          console.log('[Leo]chatMsg change====================>', val)
          this.$set(this, 'chatMsg', val)
          this.$$vm.$emit('readed', this.hxUser)
//          window.localStorage.setItem(this.hxUser, JSON.stringify(this.$$vm.chatMsg[this.hxUser]))
        })
      },
//      清除聊天记录
      clearMsg() {
        this.$clearMessage(this.hxUser)
      },
      sendMessage() {
        if (!this.inputMessage.trim()) {
          return;
        }
        this.$sendTxtMessage(this.inputMessage)

        this.userMessage = ''
        this.inputMessage = ''
      },
      sendImage(e) {
        var that = this
        let id = this.$$im.getUniqueId()// 生成本地消息id
        let msg = new WebIM.message('img', id)// 创建图片消息
        let file = WebIM.utils.getFileUrl(this.$refs.uploader)// 将图片转化为二进制文件

        if (!file.filename) {
          this.$refs.uploader.value = null;
          return false;
        }

        let allowType = {
          'jpg': true,
          'gif': true,
          'png': true,
          'bmp': true
        }

        if (file.filetype.toLowerCase() in allowType) {
          let option = {
            apiUrl: WebIM.config.apiURL,
            file: file,
            to: this.hxUser,// 接收消息对象
            roomType: false,
            chatType: 'singleChat',
            onFileUploadError: function (error) {
              console.log('[Leo]onFileUploadError:图片上传失败=>', error);
            },
            onFileUploadComplete: function (data) {
              console.log('[Leo]onFileUploadComplete:图片上传成功=>', data);
              let url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (this.$$vm.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
              that.$refs.uploader.value = null;
              let time = WebIM.time()
              console.log('[Leo]图片url=>', url)
              var msgData = {
                info: {
                  from: that.$$vm.user.hxUser,
                  to: that.hxUser,
                },
                username: that.$$vm.user.hxUser,
                yourname: that.hxUser,
                msg: {
                  type: 'img',
                  data: url
                },
                style: 'self',
                time: time,
                mid: 'img' + id,
              }
              that.$$vm.chatMsg[that.hxUser].push(msgData)
              that.$setStorageChat(that.hxUser, that.$$vm.chatMsg[that.hxUser])//保存到历史消息缓存
            },
            success: function () {// 消息发送成功
              console.log('[Leo]图片发送成功');
            },
            flashUpload: WebIM.flashUpload
          }
          msg.set(option);
          this.$$im.send(msg.body);
        }
      }
    }
  }
</script>

<style>

</style>
