<template>
  <div id="app" class="page-group">
    <router-view></router-view>
  </div>
</template>

<script>
  import axios from 'axios'
  import uri from './utils/url'

  export default {
    name: 'app',
    created() {
//      this.$addFriends('demo','备注信息')
      this.init()
    },
    methods: {
      init() {
        try {
          let _t = this
          //获取登录用户授权信息
          this.getUserInfo(111)
//            .then(res => {}).then(userInfo => {
            console.log('[Leo] => 正在登陆环信')
          _t.hxLogin()
//        }).catch(e => {
//            alert('出错了 => ' + e.message)
//        })

          //收到消息
          this.$$vm.$on('receiveMsg', ({msg, type}) => {
            console.log('[Leo]收到消息 => ', {msg, type})
          this.receiveMessage(msg, type)
        })

          //清空未读标记
//          this.$$vm.$on('readed', (hxUser) => {
//            this.$$vm.friends[hxUser] && (this.$$vm.friends[hxUser]['noread'] = 0)
//        })
        } catch (e) {
            console.log(e)
          alert('获取授权失败')
        }
      },

      /**
       * 获取登录用户的信息
       * @returns {Promise.<void>}
       */
      getUserInfo(userId) {
       const userInfo = {
            hxUser: 'test',
            id: '',
            name: 'test',
            pwd: 'test',
            photo: ''
        }
        this.$$vm.user.id = userInfo.id
        this.$$vm.user.name = userInfo.name
        this.$$vm.user.hxUser = userInfo.hxUser
        this.$$vm.user.photo = userInfo.photo

        return userInfo
//        return axios.get(`${this.$$vm.host}/api/gaouser/gaoUser/userdetail`, {params: {'user_id': userId}}).then(userInfo => {
//            console.log('[Leo]用户信息 => ', userInfo)
//        if (!userInfo.data.data) throw new Error('获取用户信息失败')
//
//        this.$$vm.user.id = userInfo.data.data.id
//        this.$$vm.user.name = userInfo.data.data.name
//        this.$$vm.user.hxUser = userInfo.data.data.hxUser
//        this.$$vm.user.photo = userInfo.data.data.photo
//
//        return userInfo.data.data
//      }).catch(e => {
//          alert('出错了 ：' + e.message)
//      })
      },
//      /**
//       * 医生列表
//       */
//      getDocList(userId) {
//        return axios.get(`${this.$$vm.host}/api/hzanddoc/gaoHzanddoc/DocList`, {params: {'user_id': userId}}).then(res => {
//            console.log('[Leo]获取医生列表 =>', res.data.data)
//        res.data.data.forEach(item => {
//          item['noread'] = 0
//          this.$set(this.$$vm.doctors, item.hxUser, item)
//      })
//        window.localStorage.setItem('docs', JSON.stringify(res.data.data))//将医生列表本地缓存，用户获取对应医生的消息历史
//      })
//      },
      /**
       * 环信登录
       */
      hxLogin() {
        try {
          var _t = this
          if (this.$$vm.user.hxUser) {
            this.$$im.open({
              apiUrl: WebIM.config.apiURL,
              user: this.$$vm.user.hxUser,
              pwd: this.$$vm.user.pwd,
              appKey: WebIM.config.appkey,
              success: function (data) {
                console.log(`[Leo]登录成功 => `, data)
                let token = data.access_token;
                WebIM.utils.setCookie('webim_' + _t.$$vm.user.hxUser, token, 1);
              }
            })
          } else {
            throw new Error('无法登录IM')
          }
        } catch (e) {
          alert(e.message)
        }
      },

      insertStranger(msg) {
        const index =this.$$vm.friends.findIndex((item) => {
          return item.from === msg.from
        })
        if(index === -1) {
          let stranger = {}
          stranger.noread = 0
          stranger.name = msg.from
          stranger.isFriends = 0
          this.$$vm.friends.push(stranger)
          // 保存到localstorage
          let strangers = JSON.parse(window.localStorage.getItem('strangers') || '[]')
          const index1 = strangers.findIndex((item) => {
            return item.name === stranger.name
          })
          if(index1 === -1) {
            strangers.push(stranger)
            window.localStorage.setItem('strangers', JSON.stringify(strangers))
          }
        }
      },
      /**
       * 收到消息
       * @param msg
       * @param type
       */
      receiveMessage(msg, type) {
        //好友列表查询是否是陌生人消息
        this.insertStranger(msg);
        console.log('收到消息===============')
        console.log(this.$$vm.friends)
        if (msg.from == this.$$vm.user.hxUser || msg.to == this.$$vm.user.hxUser) {
          var value = msg.data//默认展示的消息value

          if (type == 'txt') {//txt消息需要转Emoji图标
            value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
          }

          if (msg.ext['extension']) {//如果消息带有扩展，则消息类型从扩展中取
            type = msg.ext['extension']
            value = extensionTitle[type]
          }

          let time = WebIM.time()
          let msgData = {
            info: {
              from: msg.from,
              to: msg.to
            },
            username: '',
            yourname: msg.from,
            msg: {
              type: type || 'txt',
              data: value,
              url: msg.url,
              ext: msg.ext
            },
            style: '',
            time: time,
            mid: msg.type + msg.id
          }
          // if (msg.from == that.username) {
          msgData.style = ''
          msgData.username = msg.from
          // } else {
          //     msgData.style = 'self'
          //     msgData.username = msg.to
          // }
          let index =  this.$$vm.friends.findIndex((item) => {
            return item.name === msg.from
          })
          this.$$vm.friends[index]['noread'] = ~~this.$$vm.friends[index]['noread'] + 1 //设置未读消息数

          if (!this.$$vm.chatMsg.hasOwnProperty(msg.from)) this.$$vm.chatMsg[msg.from] = []

          this.$$vm.chatMsg[msg.from].push(msgData)

          this.$setStorageChat(msg.from, this.$$vm.chatMsg[msg.from])//将收到的消息保存到历史消息缓存
        }
      }
    }
  }
</script>

<style>

</style>
