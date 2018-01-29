import WebIM from 'WebIM';

export default {
    install: function (Vue, options) {

        //evenBus
        var vm = new Vue({
            data: {
                host: 'http://192.168.1.102:8088',//'http://www.360unicom.cn/gxy',//'http://xhh.tunnel.qydev.com',//
                appid: 'wx19600a1d8ebcf0fa',//'wxc2af942951daed31',//
                code: '',
                user: {
                    hxUser: '',
                    id: '',
                    name: 'test',
                    pwd: 'test',
                    photo: ''
                },
                applys: [],
                friends: [],
                stranger: [],
                doctors: {},
                chatMsg: {},
                errorType: -1
            },
            created() {
                //根据本地医生列表获取对应医生的本地消息历史
                // let docs = JSON.parse(window.localStorage.getItem('docs') || '[]')
                // docs.forEach(item => {
                //     this.$set(this.doctors, item.hxUser, JSON.parse(window.localStorage.getItem(item.hxUser) || '[]'))
                //
                //     //获取历史消息
                //     let userChatHistory = getStorageChat(item.hxUser)
                //     this.$set(this.chatMsg, item.hxUser, userChatHistory)
                // })
            }
        });

        //建立连接
        var im = new WebIM.connection({
            https: WebIM.config.https,
            url: WebIM.config.xmppURL,
            isAutoLogin: WebIM.config.isAutoLogin,
            isMultiLoginSessions: WebIM.config.isMultiLoginSessions
        });

        //回调监听
        im.listen({
            /**
             * 连接成功回调
             * 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
             * 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
             * 则无需调用conn.setPresence();
             * @param message
             */
            onOpened: function (message) {
                console.log('[Leo]onOpened:连接成功 =>', message)
                vm.$emit('onOpened', message)
                //region 获取环信好友列表
                im.getRoster({
                    success: function (roster) {
                        console.log('[Leo]环信好友列表', roster)
                        //获取好友列表，并进行好友列表渲染，roster格式为：
                        // [
                        //     {
                        //         jid:'asemoemo#chatdemoui_test1@easemob.com',
                        //         name:'test1',
                        //         subscription: 'both'
                        //     }
                        // ]
                      let strangers = JSON.parse(window.localStorage.getItem('strangers') || '[]')
                        for (var i = 0, l = roster.length; i < l; i++) {
                            var ros = roster[i];
                            //ros.subscription值为both/to为要显示的联系人，此处与APP需保持一致，才能保证两个客户端登录后的好友列表一致
                            if (ros.subscription === 'both' || ros.subscription === 'to') {
                              strangers.forEach((s) => {
                                if(s.name !== ros.name){
                                  vm.friends.push(s)
                                }else {
                                  const index = strangers.indexOf(s)
                                  strangers.splice(index,1)
                                }
                              })
                                ros.noread = 0
                                ros.isFriends = 1
                                vm.friends.push(ros)
                                //获取历史消息
                                let userChatHistory = getStorageChat(ros.name)
                                vm.$set(vm.chatMsg, ros.name, userChatHistory)
                            }
                        }
                    },
                })
                //endregion
            },
            /**
             * 连接关闭回调
             * @param message
             */
            onClosed: function (message) {
                console.log('[Leo]onClosed:连接关闭 =>', message)
            },
            /**
             * 收到文本消息
             * @param message
             */
            onTextMessage: function (message) {
                console.log('[Leo]onTextMessage:收到文本消息 =>', message)
                vm.$emit('receiveMsg', {msg: message, type: 'txt'})
            },
            /**
             * 收到表情消息
             * @param message
             */
            onEmojiMessage: function (message) {
                console.log('[Leo]onEmojiMessage:收到表情消息 =>', message)
                vm.$emit('receiveMsg', {msg: message, type: 'emoji'})
            },
            /**
             * 收到图片消息
             * @param message
             */
            onPictureMessage: function (message) {
                console.log('[Leo]onPictureMessage:收到图片消息 =>', message)
                vm.$emit('receiveMsg', {msg: message, type: 'img'})
            },
            /**
             * 收到命令消息
             * @param message
             */
            onCmdMessage: function (message) {
                console.log('[Leo]onCmdMessage:收到命令消息 =>', message)
            },
            /**
             * 收到音频消息
             * @param message
             */
            onAudioMessage: function (message) {
                console.log('[Leo]onAudioMessage:收到音频消息 =>', message)
                vm.$emit('receiveMsg', {msg: message, type: 'audio'})
            },
            /**
             * 收到位置消息
             * @param message
             */
            onLocationMessage: function (message) {
                console.log('[Leo]onLocationMessage:收到位置消息 =>', message)
            },
            /**
             * 收到文件消息
             * @param message
             */
            onFileMessage: function (message) {
                console.log('[Leo]onFileMessage收到文件消息 =>', message)
            },
            /**
             * 收到视频消息
             * @param message
             */
            onVideoMessage: function (message) {
                console.log('[Leo]onVideoMessage:收到视频消息 =>', message)
            },
            /**
             * 处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
             * 收到联系人订阅请求的处理方法，具体的type值所对应的值请参考xmpp协议规范
             * @param message
             */
            onPresence: function (message) {
                console.log('[Leo]onPresence:“广播”或“发布-订阅”消息 =>', message)

                //（发送者希望订阅接收者的出席信息），即别人申请加你为好友
                if (message.type === 'subscribe') {
                  console.log('===========')
                  console.log(typeof message)
                  if(typeof message === 'object') {
                    let applyMsg = {
                      from: message.from,
                      to: message.to,
                      type: message.type,
                      status: message.status //demo请求添加好友
                    }
                    vm.applys.push(message);
                  }

                  if(typeof message === 'Array'){
                    message.forEach((s) => {
                      let applyMsg = {
                        from: s.from,
                        to: s.to,
                        type: s.type,
                        status: s.status
                      }
                      vm.applys.push(message);
                    })
                  }
                    //若e.status中含有[resp:true],则表示为对方同意好友后反向添加自己为好友的消息，demo中发现此类消息，默认同意操作，完成双方互为好友；如果不含有[resp:true]，则表示为正常的对方请求添加自己为好友的申请消息。
                    /*同意添加好友操作的实现方法*/
                    // im.subscribed({
                    //     to: vm.user.name,
                    //     message: '[resp:true]'
                    // });
                    // im.subscribe({//需要反向添加对方好友
                    //     to: message.from,
                    //     message: '[resp:true]'
                    // });
                }

                //(发送者允许接收者接收他们的出席信息)，即别人同意你加他为好友
                if (message.type === 'subscribed') {

                }

                //（发送者取消订阅另一个实体的出席信息）,即删除现有好友
                if (message.type === 'unsubscribe') {

                }

                //（订阅者的请求被拒绝或以前的订阅被取消），即对方单向的删除了好友
                if (message.type === 'unsubscribed') {

                }
            },
            /**
             * 处理好友申请
             * @param message
             */
            onRoster: function (message) {
                console.log('[Leo]onRoster:好友申请 =>', message)
            },
            /**
             * 处理群组邀请
             * @param message
             */
            onInviteMessage: function (message) {
                console.log('[Leo]onInviteMessage:群组邀请 =>', message)
            },
            /**
             * 本机网络连接成功
             */
            onOnline: function () {
                console.log('[Leo]onOnline => 本机网络连接成功')
                vm.$emit('onOnline')
            },
            /**
             * 本机网络掉线
             */
            onOffline: function () {
                console.log('[Leo]onOffline => 本机网络掉线')
                vm.$emit('onOffline')
            },
            /**
             * 失败回调
             * @param message
             */
            onError: function (message) {
                console.error('[Leo]回调失败 => ', message)
                var text = '';

                switch (message.type) {
                    case WebIM.statusCode.WEBIM_CONNCTION_USER_NOT_ASSIGN_ERROR:
                        console.error('[onError]=>', vm.lan.refuse)
                        return
                    case WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED:
                        if (im.autoReconnectNumTotal < im.autoReconnectNumMax) {
                            im.errorType = message.type;
                            return;
                        }
                        im.reconnect()
                        Vue.$router.push({path: '/login'})
                }

                if (message.data && message.data.data) {
                    text = message.data.data;
                    if (JSON.parse(message.data.data)['error_description'] === 'user not found') {
                        text = vm.lan.userDoesNotExist
                    }
                } else {
                    text = WebIM.utils.getObjectKey(WebIM.statusCode, message.type) + ' ' + ' type=' + message.type;
                }

                if (im.errorType != WebIM.statusCode.WEBIM_CONNCTION_CLIENT_LOGOUT) {
                    if (message.type === WebIM.statusCode.WEBIM_CONNECTION_ACCEPT_INVITATION_FROM_GROUP
                        || message.type === WebIM.statusCode.WEBIM_CONNECTION_DECLINE_INVITATION_FROM_GROUP
                        || message.type === WebIM.statusCode.WEBIM_CONNECTION_ACCEPT_JOIN_GROUP
                        || message.type === WebIM.statusCode.WEBIM_CONNECTION_DECLINE_JOIN_GROUP
                        || message.type === WebIM.statusCode.WEBIM_CONNECTION_CLOSED) {
                        console.error(text)
                        return
                    } else {
                        if (text == 'logout' || text == 'WEBIM_CONNCTION_SERVER_ERROR  type=8') {
                            text = vm.lan.logoutSuc;
                            console.log('[Leo]logout =>', text)
                            Vue.$router.push({path: '/login'})
                        } else {
                            console.error('[Leo]onError =>', text)
                        }
                    }
                }
            },
            /**
             * 黑名单变动
             * 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
             * @param list
             */
            onBlacklistUpdate: function (list) {
                console.log('[Leo]onBlacklistUpdate:黑名单变动 =>', list);
            },
            /**
             * 收到消息送达客户端回执
             * @param message
             */
            onReceivedMessage: function (message) {
                console.log('[Leo]onReceivedMessage:收到消息送达客户端回执 =>', message)
            },
            /**
             * 收到消息送达服务器回执
             * @param message
             */
            onDeliveredMessage: function (message) {
                console.log('[Leo]onDeliveredMessage:收到消息送达服务器回执 =>', message)
            },
            /**
             * 收到消息已读回执
             * @param message
             */
            onReadMessage: function (message) {
                console.log('[Leo]onReadMessage:收到消息已读回执 =>', message)
            },
            /**
             * 创建群组成功回执（需调用createGroupNew）
             * @param message
             */
            onCreateGroup: function (message) {
                console.log('[Leo]onCreateGroup:创建群组成功回执 =>', message)
            },
            /**
             * 如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
             * @param message
             */
            onMutedMessage: function (message) {
                console.log('[Leo]onMutedMessage:禁言 =>', message)
            }
        });

      /**
       * 同意好友申请
       */
      function agreeApply(to) {
        im.subscribed({
          to: to,
          message: "[resp:true]"
        })
      }

      /**
       * 拒绝好友申请
       */
      function refuseApply(to) {
        im.unsubscribed({
          to: to,
          message: new Date().toLocaleString()
        })
      }

      /**
       * 添加好友
       */
      function addFriend(to,remark) {
        im.subscribe({
          to: to,
          message: remark // Demo里面接收方没有展现出来这个message，在status字段里面
        });
      }

      /**
       * 删除好友
       */
      function removeFriend(to) {
        im.removeRoster({
          to: to,
          success: function () {
            //通知对方已经被删除
            // im.unsubscribed({
            //   to: to
            // });
          },
          error: function () {
            console.log("删除好友失败")
          }
        });
      }
      /**
         * 环信发送消息
         * @param msg
         * @param ext
         */
        function imSendTxt(msg, ext = {}) {
            var message = new WebIM.message('txt', im.getUniqueId());

            message.set({
                msg: msg,
                to: _vm.$route.query['hxUser'],
                roomType: false,
                ext,
                success: function (id, serverMsgId) {
                    //console.log('[Leo]=>success')
                }
            });
            message.body.chatType = 'singleChat';
            im.send(message.body);

            return message
        }

        /**
         * 发送文字消息
         * @param inputMessage
         */
        function sendTxtMessage(inputMessage) {
            var message = imSendTxt(inputMessage)
            if (message) {
                let time = WebIM.time()
                let msgData = {
                    info: {
                        to: message.body.to
                    },
                    username: vm.user.hxUser,
                    yourname: message.body.to,
                    msg: {
                        type: message.type,
                        data: WebIM.parseEmoji(message.value.replace(/\n/mg, ''))
                    },
                    style: 'self',
                    time: time,
                    mid: message.id
                }
                vm.chatMsg[_vm.$route.query['hxUser']].push(msgData)
                setStorageChat(_vm.$route.query['hxUser'], vm.chatMsg[_vm.$route.query['hxUser']])//保存到历史消息缓存
            }
        }

        /**
         * 发送自定义消息
         * @param inputMessage
         * @param ext
         */
        function sendCustomMessage(inputMessage, ext) {
            var message = imSendTxt(inputMessage, ext)
            if (message) {
                let time = WebIM.time()
                let msgData = {
                    info: {
                        to: message.body.to
                    },
                    username: vm.user.hxUser,
                    yourname: message.body.to,
                    msg: {
                        type: ext['extension'] || message.type,
                        data: inputMessage,
                        ext
                    },
                    style: 'self',
                    time: time,
                    mid: message.id
                }
                vm.chatMsg[_vm.$route.query['hxUser']].push(msgData)
                setStorageChat(_vm.$route.query['hxUser'], vm.chatMsg[_vm.$route.query['hxUser']])//保存到历史消息缓存
            }
        }

        /**
         * 获取本地历史消息
         * @param key
         * @returns {Array}
         */
        function getStorageChat(key) {
            let data = window.localStorage.getItem(key)
            if (!data) return []
            return JSON.parse(data)
        }

        /**
         * 存储历史消息
         * @param key
         * @param data
         */
        function setStorageChat(key, data) {
            // let historyData = getStorageChat(key)
            window.localStorage.setItem(key, JSON.stringify(data))
        }

      /**
       * 清除聊天记录
       * @param key
       */
        function clearMessage(key) {
            vm.$set(vm.chatMsg, key, [])
            window.localStorage.removeItem(key)
        }

        Vue.prototype.$$vm = vm;
        Vue.prototype.$$im = im;
        Vue.prototype.$sendTxtMessage = sendTxtMessage;
        Vue.prototype.$addFriend = addFriend;
        Vue.prototype.$removeFriend = removeFriend;
        Vue.prototype.$agreeApply = agreeApply;
        Vue.prototype.$refuseApply = refuseApply;
        Vue.prototype.$clearMessage = clearMessage;
        Vue.prototype.$sendCustomMessage = sendCustomMessage;
        Vue.prototype.$getStorageChat = getStorageChat;
        Vue.prototype.$setStorageChat = setStorageChat;
    }
}

